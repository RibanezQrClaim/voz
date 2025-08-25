# core/intent_detector.py
from __future__ import annotations

import re
from typing import Dict, Any

# ---------------------------------------------------------
# Reglas simples de intención (texto → {"accion", "filtros"})
# Mandamientos: simple, modular, limpio y escalable.
# ---------------------------------------------------------

_RX_INT = {
    "ayer": re.compile(r"\bayer\b", re.IGNORECASE),
    "hoy": re.compile(r"\bhoy\b", re.IGNORECASE),

    # acciones base (incluye alias imperativo "resume")
    "resumen": re.compile(r"\b(resum[ée]me?|resumen|resume)\b", re.IGNORECASE),
    "quien_escribio": re.compile(r"qu[ií]en\s+me\s+escrib(?:i[oó]|ieron)", re.IGNORECASE),
    "contar_no_leidos": re.compile(r"(sin\s+leer|no\s+le[ií]dos)", re.IGNORECASE),
    "leer_ultimo": re.compile(r"(leer|lee).*(\b[uú]ltim[oa]\b|m[aá]s\s+reciente)", re.IGNORECASE),

    # importancia / listar / buscar
    "importantes": re.compile(r"(correos?\s+importantes?|importantes?)", re.IGNORECASE),
    "listar": re.compile(r"\blistar\b|\bmu[eé]strame\b|\bd[áa]me\b", re.IGNORECASE),
    "buscar": re.compile(r"\bbusca(r)?\b|\bb[uú]scame\b", re.IGNORECASE),

    # alertas
    "alertas": re.compile(r"\balertas?\b|\bcr[ií]ticos?\b", re.IGNORECASE),
}

_RX_NUM = re.compile(r"\b(\d{1,3})\b")  # captura números sueltos (top N)
_RX_REMITENTE = re.compile(r"(de|del|desde)\s+([\w\.\-\+%]+@[\w\.\-]+\.\w+)", re.IGNORECASE)
_RX_REMITENTE_TXT = re.compile(r"(de|del|desde)\s+([a-z0-9\.\-\+_%]+)", re.IGNORECASE)


def _has(pattern_key: str, text: str) -> bool:
    rx = _RX_INT[pattern_key]
    return bool(rx.search(text))


def _extract_top_n(text: str, default: int, lo: int = 1, hi: int = 50) -> int:
    m = _RX_NUM.search(text)
    if not m:
        return default
    try:
        n = int(m.group(1))
        return max(lo, min(hi, n))
    except Exception:
        return default


def _extract_remitente(text: str) -> str | None:
    m = _RX_REMITENTE.search(text)
    if m:
        return m.group(2).strip().lower()
    m2 = _RX_REMITENTE_TXT.search(text)
    if m2:
        return m2.group(2).strip().lower()
    return None


def detectar_intencion(comando: str) -> Dict[str, Any]:
    """
    Retorna un dict con estructura:
    {
      "accion": str,
      "filtros": { ... }
    }
    """
    texto = (comando or "").strip()
    low = texto.lower()
    filtros: Dict[str, Any] = {}

    # ------------------ AYER / HOY ------------------
    pide_ayer = _has("ayer", low)
    # (opcional) no usamos explícito "hoy"; por diseño "hoy" es default

    # ------------------ INTENCIONES BASE ------------------

    # 1) Resumen (hoy/ayer)
    if _has("resumen", low):
        return {"accion": "resumen_ayer" if pide_ayer else "resumen_hoy", "filtros": filtros}

    # 2) Quién me escribió (hoy/ayer)
    if _has("quien_escribio", low):
        return {"accion": "remitentes_ayer" if pide_ayer else "remitentes_hoy", "filtros": filtros}

    # 3) No leídos
    if _has("contar_no_leidos", low):
        return {"accion": "contar_no_leidos", "filtros": filtros}

    # 4) Leer último
    if _has("leer_ultimo", low):
        return {"accion": "leer_ultimo", "filtros": filtros}

    # ------------------ IMPORTANCIA / LISTAR / BUSCAR ------------------

    # 5) Importantes (permite “top N” y “ventana Xh” en el futuro)
    if _has("importantes", low):
        top_n = _extract_top_n(low, default=3, lo=1, hi=10)
        filtros["top_n"] = top_n
        # ventana default se maneja en utils.importance
        return {"accion": "correos_importantes", "filtros": filtros}

    # 6) Listar (hoy/ayer, top N, filtro por remitente)
    if _has("listar", low):
        top_n = _extract_top_n(low, default=20, lo=1, hi=100)
        filtros["cantidad"] = top_n
        filtros["fecha"] = "ayer" if pide_ayer else "hoy"
        rem = _extract_remitente(low)
        if rem:
            filtros["remite"] = rem
        return {"accion": "listar_correos", "filtros": filtros}

    # 7) Buscar por remitente (hoy/ayer)
    if _has("buscar", low):
        rem = _extract_remitente(low)
        if rem:
            filtros["remite"] = rem
        filtros["fecha"] = "ayer" if pide_ayer else "hoy"
        return {"accion": "buscar_correos", "filtros": filtros}

    # ------------------ ALERTAS ------------------
    if _has("alertas", low):
        return {"accion": "alertas_hoy", "filtros": filtros}

    # ------------------ DEFAULT ------------------
    # Fallback inteligente: si menciona "ayer" y "correo(s)" y "quién", tratamos como remitentes_ayer
    if pide_ayer and re.search(r"\b(correos?|email|mail)\b", low) and re.search(r"qu[ií]en", low):
        return {"accion": "remitentes_ayer", "filtros": filtros}

    # Por defecto, intentamos resumen_hoy
    return {"accion": "resumen_hoy", "filtros": filtros}
