# interfaces/comando_api.py
from __future__ import annotations

import os
import time
import unicodedata
from typing import Any, Dict, Tuple

from flask import Blueprint, request, jsonify

# Config / paths helpers
from utils.config import get_fake_emails_path
import utils.config as cfg  # acceso a cfg.CONFIG

# Logger (observabilidad Fase 4)
from utils.logger import Timer, log_event, log_error

# Retry (H4 — Robustez)
from utils.retry import RetryError, consume_gmail_retry_stats

# Intent detector (única fuente de verdad)
try:
    from core.intent_detector import detectar_intencion  # type: ignore
except Exception:
    detectar_intencion = None  # fallback definido más abajo

# Router (ejecutor de acciones)
from core.action_router import ejecutar_accion

# Circuit Breaker (Fase 4)
from utils.circuit_breaker import status as cb_status

# Contexto (opcional, si existe en tu proyecto)
try:
    from utils.contexto import cargar_contexto  # type: ignore
except Exception:
    def cargar_contexto(usuario_id: str) -> Dict[str, Any]:
        return {}


def _strip_accents_lower(s: str) -> str:
    s = unicodedata.normalize("NFD", s or "")
    s = "".join(ch for ch in s if unicodedata.category(ch) != "Mn")
    return s.lower()


# ===================== Fallback mínimo de intención (si faltara core.intent_detector) =====================

def _detectar_intencion_fallback(texto: str) -> Dict[str, Any]:
    t = _strip_accents_lower(texto)
    filtros: Dict[str, Any] = {}
    accion = "resumen_hoy"

    if any(k in t for k in ("importante", "importantes", "urgente", "prioritario")):
        accion = "correos_importantes"
    elif ("quien me escribio" in t) or ("remitentes" in t):
        accion = "remitentes_ayer" if "ayer" in t else "remitentes_hoy"
    elif ("sin leer" in t) or ("no leidos" in t):
        accion = "contar_no_leidos"
    elif ("resumen" in t) or ("resume" in t):
        accion = "resumen_ayer" if "ayer" in t else "resumen_hoy"

    return {"accion": accion, "filtros": filtros}


def _override_intencion_si_corresponde(comando: str, intencion: Dict[str, Any]) -> Dict[str, Any]:
    """
    Hotfix robusto: si el detector devuelve 'resumen_*' pero el texto dice
    'quién me escribió', forzamos remitentes_* (respetando hoy/ayer).
    """
    try:
        accion = (intencion.get("accion") or "").strip().lower()
    except Exception:
        return intencion

    t = _strip_accents_lower(comando)

    if accion in {"resumen_hoy", "resumen_ayer"}:
        if "quien me escribio" in t or "quien escribio" in t or "remitentes" in t:
            intencion = {
                "accion": "remitentes_ayer" if "ayer" in t else "remitentes_hoy",
                "filtros": intencion.get("filtros", {}),
            }
    return intencion


def _make_contexto(usuario_id: str) -> Dict[str, Any]:
    ctx = cargar_contexto(usuario_id) or {}
    fake_path_env = os.getenv("FAKE_EMAILS_PATH") or os.getenv("FAKE_EMAILS_FILE")
    ctx["FAKE_EMAILS_PATH"] = fake_path_env or str(get_fake_emails_path())
    ctx["USE_FAKE_GMAIL"] = os.getenv("USE_FAKE_GMAIL", "0").lower() in {"1", "true", "yes"}
    return ctx


def _mensaje_amable_por_accion(accion: str, code: int | None) -> str:
    code_txt = f"(código {code})" if code is not None else ""
    base = f"No pude conectarme a Gmail ahora {code_txt}. Intenta otra vez en unos minutos."
    mapa = {
        "remitentes_hoy": f"No pude obtener los remitentes de hoy {code_txt}. Intenta nuevamente en unos minutos.",
        "remitentes_ayer": f"No pude obtener los remitentes de ayer {code_txt}. Intenta nuevamente en unos minutos.",
        "contar_no_leidos": f"No pude contar los correos no leídos {code_txt}. Intenta nuevamente en unos minutos.",
        "resumen_hoy": f"No pude generar el resumen de hoy {code_txt}. Intenta nuevamente en unos minutos.",
        "resumen_ayer": f"No pude generar el resumen de ayer {code_txt}. Intenta nuevamente en unos minutos.",
        "leer_ultimo": f"No pude leer el último correo {code_txt}. Intenta nuevamente en unos minutos.",
        "correos_importantes": f"No pude evaluar los correos importantes {code_txt}. Intenta nuevamente en unos minutos.",
        "buscar_correo": f"No pude buscar correos {code_txt}. Intenta nuevamente en unos minutos.",
    }
    return mapa.get((accion or "").lower(), base)


# =============== Circuit Breaker Guard (Fase 4) ===============

# Acciones que activan lecturas intensivas (messages.get/list)
_GUARDED_ACTIONS = {
    "remitentes_hoy",
    "remitentes_ayer",
    "contar_no_leidos",
    "resumen_hoy",
    "resumen_ayer",
    "leer_ultimo",
    "correos_importantes",
    "buscar_correo",
}

def _breaker_guard_or_503() -> Tuple[Dict[str, Any] | None, int | None]:
    """
    Si el breaker está abierto, devolvemos 503 con 'retry_after_s'.
    Controlable por config: gmail.circuit_breaker.user_notice (default True).
    """
    try:
        user_notice = bool(cfg.CONFIG.get("gmail", {}).get("circuit_breaker", {}).get("user_notice", True))
    except Exception:
        user_notice = True
    if not user_notice:
        return None, None

    st = cb_status("gmail:messages.get")
    if not st.get("allow", True):
        retry = int(st.get("retry_after_s", 0))
        return {
            "ok": False,
            "degraded": True,
            "reason": "Circuit breaker activo por alta tasa de errores de Gmail",
            "retry_after_s": retry
        }, 503
    return None, None


# ===================== Blueprint y endpoints =====================

comando_bp = Blueprint("comando_api", __name__, url_prefix="/api")


@comando_bp.route("/ping", methods=["GET"])
def ping() -> Any:
    return jsonify({"ok": True, "ts": time.time()})


@comando_bp.route("/comando", methods=["POST"])
def procesar_comando() -> Any:
    # ⏱️ métrica de duración
    t = Timer.start()

    data = request.get_json(silent=True) or {}
    print("📥 JSON recibido:", data)

    comando = data.get("comando") or data.get("texto") or ""
    usuario_id = str(data.get("usuario_id") or "1").strip()

    if isinstance(comando, str) and len(comando) > 8192:
        return jsonify({"ok": False, "error": "Comando demasiado largo"}), 400

    # Detectar intención
    try:
        intencion = detectar_intencion(comando) if detectar_intencion else _detectar_intencion_fallback(comando)
    except Exception as e:
        print(f"⚠️ Error en detectar_intencion: {e}. Usando fallback.")
        intencion = _detectar_intencion_fallback(comando)

    # Hotfix robusto para '¿Quién me escribió ...?'
    intencion = _override_intencion_si_corresponde(comando, intencion)
    accion = (intencion.get("accion") or "desconocida").lower()

    # Logs clásicos a consola (útiles en dev)
    print("🔍 Intención por reglas simples:", intencion.get("accion"))
    print("🎯 Ejecutando acción:", intencion)
    print("🔍 Tipo de intención:", type(intencion))
    print("🔄 Acción original:", intencion.get("accion"))

    # Contexto y backend
    contexto = _make_contexto(usuario_id)
    backend = "fake" if contexto.get("USE_FAKE_GMAIL") else "real"

    # ---- Circuit Breaker: aviso al usuario si está OPEN (solo para acciones intensivas)
    if accion in _GUARDED_ACTIONS:
        guard_payload, guard_code = _breaker_guard_or_503()
        if guard_payload is not None:
            # Log de evento degradado (sin golpear backend)
            duration_ms = t.ms()
            log_event(
                usuario_id,
                accion=accion,
                backend=backend,
                duration_ms=duration_ms,
                ok=False,
                items=0,
                extra={"endpoint": "/api/comando", "breaker_open": True},
            )
            return jsonify(guard_payload), int(guard_code)

    # Ejecutar acción y responder
    try:
        try:
            resultado = ejecutar_accion(
                intencion,
                comando=comando,
                contexto=contexto,
                filtros=intencion.get("filtros"),
            )
        except TypeError:
            # Compatibilidad con firma anterior
            resultado = ejecutar_accion(intencion, comando)

        # Métricas
        duration_ms = t.ms()
        items = len(resultado) if isinstance(resultado, list) else 1

        # Métricas de retry agregadas (éxitos)
        retry_stats = consume_gmail_retry_stats()
        extra = {"endpoint": "/api/comando"}
        if retry_stats.get("calls", 0) > 0:
            extra.update({
                "retries_by_code": retry_stats.get("retries_by_code", {}),
                "slept_ms_total": retry_stats.get("slept_ms_total", 0),
            })

        log_event(
            usuario_id,
            accion=accion,
            backend=backend,
            duration_ms=duration_ms,
            ok=True,
            items=items,
            extra=extra,
        )
        print(f"⏱️ comando_api duration_ms={duration_ms:.2f}")

        # Respuesta uniforme
        if isinstance(resultado, str):
            return jsonify({"ok": True, "respuesta": resultado})
        return jsonify({"ok": True, "data": resultado})

    except RetryError as re:
        # Error tras reintentos: responder amable y loggear métricas de robustez
        duration_ms = t.ms()
        extra = {
            "endpoint": "/api/comando",
            "retries_by_code": re.retries_by_code,
            "last_error": re.last_error_code,
            "attempts": re.attempts,
        }
        log_event(
            usuario_id,
            accion=accion,
            backend=backend,
            duration_ms=duration_ms,
            ok=False,
            items=0,
            extra=extra,
        )
        mensaje = _mensaje_amable_por_accion(accion, re.last_error_code)
        # 503 como fallback de “servicio no disponible” (rate/5xx)
        return jsonify({"ok": False, "error": mensaje, "code": re.last_error_code}), 503

    except Exception as e:
        duration_ms = t.ms()
        log_error(
            usuario_id,
            accion=accion,
            backend=backend,
            error=e,
            duration_ms=duration_ms,
            extra={"endpoint": "/api/comando"},
        )
        print(f"⛑️ comando_api error after {duration_ms:.2f} ms: {e}")

        # Manejo explícito del error simulado 429 → devolver degradación como si el breaker estuviera abierto
        if "Simulated Gmail error 429" in str(e):
            cooldown = int(cfg.CONFIG.get("gmail", {}).get("circuit_breaker", {}).get("cooldown_seconds", 30))
            return jsonify({
                "ok": False,
                "degraded": True,
                "reason": "Circuit breaker activo por alta tasa de errores de Gmail (simulado)",
                "retry_after_s": cooldown
            }), 503

        return jsonify({"ok": False, "error": str(e)}), 500
