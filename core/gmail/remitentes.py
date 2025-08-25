# core/gmail/remitentes.py
from __future__ import annotations

from typing import List, Dict, Any, Optional
from datetime import datetime, timezone, timedelta
import os, re, base64, html

try:
    from zoneinfo import ZoneInfo  # pip install tzdata en Windows
except Exception:
    ZoneInfo = None

# ========= config =========
try:
    from utils.config import get_config
    _CFG = get_config() or {}
except Exception:
    _CFG = {}

def _cfg(path: str, default=None):
    cur = _CFG
    for k in path.split("."):
        if not isinstance(cur, dict) or k not in cur:
            return default
        cur = cur[k]
    return cur

PRIMARY_EMAIL: str = (_cfg("gmail.primary_email", "carolina@home.cl") or "").lower()
TIMEZONE_STR: str = _cfg("gmail.timezone", "America/Santiago")
GMAIL_MAX_RESULTS: int = int(_cfg("gmail.max_results", 50))
TZ_SCL = ZoneInfo(TIMEZONE_STR) if ZoneInfo else timezone.utc

USE_FAKE_GMAIL = os.getenv("USE_FAKE_GMAIL", "0").lower() in {"1", "true", "yes"}

# ========= Gmail API (real) =========
if not USE_FAKE_GMAIL:
    from core.gmail.auth import get_authenticated_service  # type: ignore

MESSAGE_FIELDS_LIST = "messages(id),nextPageToken"
MESSAGE_FIELDS_GET_FULL = (
    "id,internalDate,labelIds,snippet,"
    "payload(mimeType,body/data,parts,headers(name,value))"
)

EXCLUDED_LABELS = {
    "CATEGORY_SOCIAL", "CATEGORY_PROMOTIONS", "CATEGORY_UPDATES",
    "CATEGORY_FORUMS", "SPAM", "TRASH",
}

# ========= helpers comunes =========

def _headers_lower(meta: Dict[str, Any]) -> Dict[str, str]:
    headers = (meta.get("payload", {}) or {}).get("headers", []) or []
    return {h.get("name", "").lower(): h.get("value", "") for h in headers if isinstance(h, dict)}

def _msg_datetime_local(meta: Dict[str, Any]) -> Optional[datetime]:
    try:
        ts_iso = meta.get("ts")
        if isinstance(ts_iso, str) and ts_iso:
            dt = datetime.fromisoformat(ts_iso)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt.astimezone(TZ_SCL) if TZ_SCL else dt

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

def _is_to_me(meta: Dict[str, Any]) -> bool:
    """True si el correo va dirigido al PRIMARY_EMAIL (header 'To' o campo top-level 'to')."""
    hdrs = _headers_lower(meta)
    to_hdr = (hdrs.get("to") or "").lower()
    if PRIMARY_EMAIL in to_hdr:
        return True
    to_list = meta.get("to") or []
    for x in to_list:
        if isinstance(x, str) and PRIMARY_EMAIL in x.lower():
            return True
    return False

# ========= fake / real loaders =========

def _primary_query(base_query: Optional[str] = None) -> str:
    parts = [
        "category:primary", "-category:social", "-category:promotions",
        "-category:updates", "-category:forums", "-in:spam", "-in:trash",
    ]
    if base_query:
        parts.append(f"({base_query})")
    return " ".join(parts)

def _list_primary_message_ids(service, max_results: int, base_query: Optional[str]) -> List[str]:
    q = _primary_query(base_query)
    resp = (
        service.users()
        .messages()
        .list(
            userId="me",
            q=q,
            labelIds=["INBOX"],
            maxResults=max_results,
            includeSpamTrash=False,
            fields=MESSAGE_FIELDS_LIST,
        )
        .execute()
        or {}
    )
    return [m["id"] for m in resp.get("messages", []) or []]

def _get_message_full(service, msg_id: str) -> Dict[str, Any]:
    return (
        service.users()
        .messages()
        .get(
            userId="me",
            id=msg_id,
            format="full",
            fields=MESSAGE_FIELDS_GET_FULL,
        )
        .execute()
        or {}
    )

# ========= core logic =========

def _remitentes_para_fecha(target_date: datetime.date, max_fetch: int = GMAIL_MAX_RESULTS) -> List[str]:
    """
    Devuelve lista de remitentes únicos para la fecha local indicada (hoy/ayer),
    sólo correos directos (no CC-only), y sólo bandeja principal.
    """
    seen = set()
    out: List[str] = []

    # ---- FAKE ----
    if USE_FAKE_GMAIL:
        try:
            from utils.fake_gmail import listar  # orden: más recientes primero
        except Exception:
            return out

        try:
            msgs: List[Dict[str, Any]] = listar(max_fetch)
        except TypeError:
            msgs = listar()[:max_fetch]  # compat

        for meta in msgs:
            if meta.get("meta", {}).get("cc_only", False):
                continue
            dt_local = _msg_datetime_local(meta)
            if not (dt_local and dt_local.date() == target_date):
                continue
            if not _is_to_me(meta):
                continue
            frm = (_headers_lower(meta).get("from") or "").strip()
            if frm and frm not in seen:
                seen.add(frm)
                out.append(frm)
        return out

    # ---- REAL ----
    try:
        service = get_authenticated_service()
    except Exception:
        return out

    # Traemos margen de 2 días para cubrir 'ayer' con seguridad
    base_q = "newer_than:2d"
    try:
        ids = _list_primary_message_ids(service, max_fetch, base_query=base_q)
    except Exception:
        ids = []

    for mid in ids:
        try:
            meta = _get_message_full(service, mid)
        except Exception:
            continue
        if not meta:
            continue
        if set(meta.get("labelIds", []) or []) & EXCLUDED_LABELS:
            continue
        if meta.get("meta", {}).get("cc_only", False):
            continue
        dt_local = _msg_datetime_local(meta)
        if not (dt_local and dt_local.date() == target_date):
            continue
        if not _is_to_me(meta):
            continue
        frm = (_headers_lower(meta).get("from") or "").strip()
        if frm and frm not in seen:
            seen.add(frm)
            out.append(frm)

    return out

def remitentes_hoy() -> List[str]:
    now_local = datetime.now(TZ_SCL) if TZ_SCL else datetime.now(timezone.utc)
    return _remitentes_para_fecha(now_local.date(), max_fetch=GMAIL_MAX_RESULTS)

def remitentes_ayer() -> List[str]:
    now_local = datetime.now(TZ_SCL) if TZ_SCL else datetime.now(timezone.utc)
    yday = (now_local - timedelta(days=1)).date()
    return _remitentes_para_fecha(yday, max_fetch=GMAIL_MAX_RESULTS)
