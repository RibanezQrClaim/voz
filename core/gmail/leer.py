# core/gmail/leer.py
from typing import List, Dict, Any, Optional, Tuple
from email.utils import parsedate_to_datetime
from datetime import datetime, timezone
import os
from concurrent.futures import ThreadPoolExecutor, as_completed

from .auth import get_authenticated_service
from utils.dates import get_rfc3339_today
from utils import config
from utils.retry import gmail_retry_wrapper, RetryError
from utils.cache import cache_get, cache_set, make_cache_key
from utils.circuit_breaker import before_call as cb_before, after_success as cb_ok, after_failure as cb_fail, configure as cb_conf

CB_KEY_GET = "gmail:messages.get"

def _effective_concurrency(settings: Dict[str, Any]) -> int:
    if os.getenv("USE_FAKE_GMAIL", "").strip().lower() in {"1", "true", "yes", "y"}:
        return 1
    val = int(settings.get("concurrency_get", 4))
    if val < 1:
        val = 1
    if val > 16:
        val = 16
    return val

def _primary_query(base_query: Optional[str] = None) -> str:
    parts = [
        "category:primary",
        "-category:social",
        "-category:promotions",
        "-category:updates",
        "-category:forums",
        "-in:spam",
        "-in:trash",
    ]
    if base_query:
        parts.append(f"({base_query})")
    return " ".join(parts)

def _list_primary_message_ids(service, settings: Dict[str, Any], base_query: Optional[str] = None) -> List[str]:
    q = _primary_query(base_query)
    max_results = settings["max_results"]
    fields_list = settings["fields_list"]

    ids: List[str] = []
    page_token = None

    while len(ids) < max_results:
        def _call():
            return (
                service.users()
                .messages()
                .list(
                    userId="me",
                    q=q,
                    labelIds=["INBOX"],
                    maxResults=min(max_results - len(ids), max_results),
                    includeSpamTrash=False,
                    fields=fields_list,
                    pageToken=page_token,
                )
                .execute()
                or {}
            )

        resp, meta = gmail_retry_wrapper(_call, settings)
        msgs = resp.get("messages", []) or []
        ids.extend([m["id"] for m in msgs])
        page_token = resp.get("nextPageToken")
        if not page_token or len(ids) >= max_results:
            break

    return ids[:max_results]

def _get_message_metadata(service, msg_id: str, settings: Dict[str, Any]) -> Dict[str, Any]:
    fields_get = settings["fields_get"]
    wanted_headers = [h.lower() for h in settings["headers_get"]]
    excluded_labels = set(settings.get("excluded_labels", []))
    ttl = int(settings.get("cache_ttl_seconds", 60))

    # Configure breaker según settings (idempotente y barato)
    cb_conf(CB_KEY_GET,
            threshold=int(settings.get("cb_threshold", 3)),
            cooldown_s=int(settings.get("cb_cooldown_s", 30)))

    # ---- CACHE: lookup previo
    cache_key = make_cache_key("msg_get", id=msg_id, fields=fields_get)
    cached = cache_get(cache_key)
    if cached is not None:
        return cached

    # ---- CIRCUIT BREAKER: precheck
    if settings.get("cb_enabled", True):
        allow, retry_after = cb_before(CB_KEY_GET)
        if not allow:
            # Degradamos silenciosamente este item
            return {}

    def _call():
        return (
            service.users()
            .messages()
            .get(
                userId="me",
                id=msg_id,
                format="metadata",
                metadataHeaders=settings["headers_get"],
                fields=fields_get,
            )
            .execute()
            or {}
        )

    try:
        msg, meta = gmail_retry_wrapper(_call, settings)
        # éxito → cerrar breaker si estaba half-open
        if settings.get("cb_enabled", True):
            cb_ok(CB_KEY_GET)
    except RetryError as e:
        # fallo → incrementar breaker (si aplica)
        if settings.get("cb_enabled", True):
            code = getattr(e, "code", 429)
            cb_fail(CB_KEY_GET, int(code))
        # devolvemos vacío para que el batch lo filtre
        return {}

    label_ids = set(msg.get("labelIds", []) or [])
    if label_ids & excluded_labels:
        return {}

    headers = msg.get("payload", {}).get("headers", [])
    filtered = [h for h in headers if h.get("name", "").lower() in wanted_headers]
    if "payload" in msg:
        msg["payload"]["headers"] = filtered

    if ttl > 0:
        cache_set(cache_key, msg, ttl)

    return msg

def _batch_get_metadata(service, ids: List[str], settings: Dict[str, Any]) -> List[Dict[str, Any]]:
    if not ids:
        return []
    pos_by_id: Dict[str, int] = {mid: i for i, mid in enumerate(ids)}
    results: List[Tuple[int, Dict[str, Any]]] = []
    conc = _effective_concurrency(settings)

    if conc <= 1 or len(ids) == 1:
        for mid in ids:
            try:
                meta = _get_message_metadata(service, mid, settings)
                if meta:
                    results.append((pos_by_id[mid], meta))
            except RetryError:
                continue
    else:
        def fetch_one(mid: str) -> Tuple[int, Dict[str, Any]]:
            try:
                meta = _get_message_metadata(service, mid, settings)
                return (pos_by_id[mid], meta if meta else {})
            except RetryError:
                return (pos_by_id[mid], {})

        with ThreadPoolExecutor(max_workers=conc, thread_name_prefix="gmail-get") as ex:
            future_by_id = {ex.submit(fetch_one, mid): mid for mid in ids}
            for fut in as_completed(future_by_id):
                idx, meta = fut.result()
                if meta:
                    results.append((idx, meta))

    results.sort(key=lambda t: t[0])
    return [m for _, m in results]

def listar(max_results: Optional[int] = None, base_query: Optional[str] = None) -> List[Dict[str, Any]]:
    settings = config.get_gmail_settings()
    if max_results:
        settings["max_results"] = min(max_results, settings["max_results"])
    service = get_authenticated_service()
    ids = _list_primary_message_ids(service, settings, base_query=base_query)
    return _batch_get_metadata(service, ids, settings)

def _headers_dict(meta: Dict[str, Any]) -> Dict[str, str]:
    return {h["name"].lower(): h["value"] for h in meta.get("payload", {}).get("headers", [])}

def _is_today(meta: Dict[str, Any]) -> bool:
    hdrs = _headers_dict(meta)
    dt_local: Optional[datetime] = None
    if "date" in hdrs:
        try:
            dt = parsedate_to_datetime(hdrs["date"])
            dt_local = dt.astimezone() if dt.tzinfo else dt.replace(tzinfo=timezone.utc).astimezone()
        except Exception:
            dt_local = None
    if dt_local is None:
        try:
            ms = int(meta.get("internalDate", 0))
            dt_local = datetime.fromtimestamp(ms / 1000.0).astimezone()
        except Exception:
            return False
    return dt_local.date() == datetime.now().astimezone().date()

def _to_contains_me(hdrs: Dict[str, str]) -> bool:
    primary_email = (config.gmail_primary_email() or "").lower()
    return primary_email in hdrs.get("to", "").lower()

def remitentes_hoy() -> List[str]:
    settings = config.get_gmail_settings()
    service = get_authenticated_service()
    after = get_rfc3339_today()
    ids = _list_primary_message_ids(service, settings, base_query=f"after:{after}")
    metas = _batch_get_metadata(service, ids, settings)
    remitentes = set()
    for meta in metas:
        if meta.get("meta", {}).get("cc_only", False):
            continue
        if not _is_today(meta):
            continue
        hdrs = _headers_dict(meta)
        if not _to_contains_me(hdrs):
            continue
        frm = hdrs.get("from", "").strip()
        if frm:
            remitentes.add(frm)
    return sorted(remitentes)

def leer_ultimo() -> Dict[str, Any]:
    settings = config.get_gmail_settings()
    service = get_authenticated_service()
    ids = _list_primary_message_ids(service, settings, base_query=None)
    if not ids:
        return {}
    return _get_message_metadata(service, ids[0], settings)

def contar_no_leidos() -> int:
    settings = config.get_gmail_settings()
    service = get_authenticated_service()
    ids = _list_primary_message_ids(service, settings, base_query="is:unread")
    metas = _batch_get_metadata(service, ids, settings)
    count = 0
    excluded = set(settings.get("excluded_labels", []))
    for meta in metas:
        labels = set(meta.get("labelIds", []) or [])
        if labels & excluded:
            continue
        if "UNREAD" in labels:
            count += 1
    return count
