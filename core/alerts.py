# core/alerts.py
from __future__ import annotations
from typing import List, Dict, Any, Set, Tuple, Optional
import os
from datetime import datetime, timezone

try:
    from zoneinfo import ZoneInfo
    TZ_SCL = ZoneInfo("America/Santiago")
except Exception:
    TZ_SCL = timezone.utc

PRIMARY_EMAIL = os.getenv("PRIMARY_EMAIL", "carolina@home.cl").lower()
USE_FAKE_GMAIL = os.getenv("USE_FAKE_GMAIL", "0").lower() in {"1", "true", "yes"}

# Config centralizada
from utils.config import get_critical_keywords

# ---------- helpers básicos ----------
def _headers_lower(meta: Dict[str, Any]) -> Dict[str, str]:
    headers = (meta.get("payload", {}) or {}).get("headers", []) or []
    return {h.get("name", "").lower(): h.get("value", "") for h in headers if isinstance(h, dict)}

def _msg_datetime_local(meta: Dict[str, Any]) -> Optional[datetime]:
    """
    Prioriza ts (ISO en fixtures fake), luego header Date, luego internalDate (ms).
    Devuelve un datetime en America/Santiago.
    """
    try:
        ts_iso = meta.get("ts")
        if isinstance(ts_iso, str) and ts_iso:
            try:
                dt = datetime.fromisoformat(ts_iso)
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                return dt.astimezone(TZ_SCL) if TZ_SCL else dt
            except Exception:
                pass

        hdrs = _headers_lower(meta)
        date_hdr = hdrs.get("date")
        if date_hdr:
            from email.utils import parsedate_to_datetime
            dt = parsedate_to_datetime(date_hdr)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt.astimezone(TZ_SCL) if TZ_SCL else dt

        internal = meta.get("internalDate")
        if internal is not None:
            ts_ms = int(internal) if isinstance(internal, str) else int(internal)
            dt = datetime.fromtimestamp(ts_ms / 1000.0, tz=timezone.utc)
            return dt.astimezone(TZ_SCL) if TZ_SCL else dt

        return None
    except Exception:
        return None

def _is_today_local(meta: Dict[str, Any]) -> bool:
    dt = _msg_datetime_local(meta)
    if not dt:
        return False
    now_local = datetime.now(TZ_SCL) if TZ_SCL else datetime.now(timezone.utc)
    return dt.date() == now_local.date()

def _to_contains_me(hdrs: Dict[str, str]) -> bool:
    return PRIMARY_EMAIL in (hdrs.get("to", "").lower())

def _collect_text(meta: Dict[str, Any]) -> str:
    """Subject + snippet + body(text|html->texto) en una sola cadena minúscula (best-effort)."""
    hdrs = _headers_lower(meta)
    subject = (hdrs.get("subject") or "").strip()
    snippet = (meta.get("snippet") or "").strip()
    body_text = ""
    payload = (meta.get("payload") or {})
    body = payload.get("body") or {}
    if isinstance(body.get("text"), str):
        body_text = body["text"]
    return f"{subject}\n{snippet}\n{body_text}".lower()

# ---------- núcleo de alertas ----------
def detectar_keywords(texto: str, keywords: List[str]) -> Set[str]:
    t = texto.lower()
    hits = set()
    for kw in keywords:
        k = (kw or "").strip().lower()
        if not k:
            continue
        if k in t:
            hits.add(k)
    return hits

def detectar_alertas_hoy(msgs: List[Dict[str, Any]]) -> Tuple[int, Set[str]]:
    """
    Filtra HOY + directos (To:), ignora cc_only (si viene en fixture).
    Retorna: (cantidad_de_correos_críticos, set_keywords_detectados)
    """
    critical = [x.strip().lower() for x in get_critical_keywords() if str(x).strip()]
    if not critical:
        return 0, set()

    count_critical = 0
    all_hits: Set[str] = set()

    for meta in msgs:
        if meta.get("meta", {}).get("cc_only", False):
            continue
        if not _is_today_local(meta):
            continue
        hdrs = _headers_lower(meta)
        if not _to_contains_me(hdrs):
            continue

        text = _collect_text(meta)
        hits = detectar_keywords(text, critical)
        if hits:
            count_critical += 1
            all_hits |= hits

    return count_critical, all_hits

def formatear_alerta(cantidad: int, hits: Set[str]) -> str:
    if cantidad <= 0:
        return "Hoy no hay correos críticos."
    top = ", ".join(sorted(list(hits))[:5])
    return f"⚠️ Hoy tienes {cantidad} correo(s) críticos ({top})."

# ---------- función pública (router la usa) ----------
def alertas_hoy(max_results: int = 10) -> str:
    """
    Orquesta fake/real, lista mensajes recientes y devuelve la alerta formateada.
    """
    msgs: List[Dict[str, Any]] = []
    if USE_FAKE_GMAIL:
        try:
            from utils.fake_gmail import listar
            try:
                msgs = listar(max_results)
            except TypeError:
                msgs = listar()[:max_results]  # compat if listar() no acepta args
        except Exception as e:
            print(f"alertas_hoy backend=fake error_import={e}")
            return "No fue posible obtener los correos (fake)."
    else:
        try:
            from core.gmail.auth import get_authenticated_service
            from core.gmail.leer import _list_primary_message_ids, _get_message_metadata
            service = get_authenticated_service()
            ids = _list_primary_message_ids(service, max_results, base_query="newer_than:1d")
            for mid in ids:
                try:
                    meta = _get_message_metadata(service, mid)
                    if meta:
                        msgs.append(meta)
                except Exception:
                    continue
        except Exception as e:
            print(f"alertas_hoy backend=real error={e}")
            return "No fue posible obtener los correos."

    cantidad, hits = detectar_alertas_hoy(msgs)
    return formatear_alerta(cantidad, hits)
