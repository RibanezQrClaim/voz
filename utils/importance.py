# utils/importance.py
from __future__ import annotations

from typing import List, Dict, Any, Optional, Tuple
import os, re, math, time, html, base64
from datetime import datetime, timezone, timedelta

try:
    from zoneinfo import ZoneInfo  # en Windows: pip install tzdata
except Exception:
    ZoneInfo = None

# ===================== Configuración =====================

# Intentamos cargar desde config.json (si existe utilitario)
_DEFAULT_CONFIG = {
    "recency_half_life_h": 24,           # half-life en horas
    "important_senders": [               # remitentes/domain con boost
        "ceo@home.cl",
        "@cliente-grande.com",
        "finanzas@home.cl",
    ],
    "keyword_weights": {                 # pesos por palabra/expresión
        "urgente": 18,
        "vencimiento": 14,
        "rechazo de pago": 14,
        "respuesta requerida": 12,
        "reunión": 6,
        "hoy": 5,
    },
    "important_min_score": 25            # umbral de importancia
}

def _load_config() -> Dict[str, Any]:
    try:
        from utils.config import get_config  # type: ignore
        cfg = get_config().get("importance", {}) or {}
        # merge con defaults
        merged = dict(_DEFAULT_CONFIG)
        merged.update(cfg)
        return merged
    except Exception:
        return dict(_DEFAULT_CONFIG)

CFG = _load_config()

RECENCY_HALF_LIFE_H: float = float(CFG.get("recency_half_life_h", 24))
IMPORTANT_SENDERS: List[str] = list(CFG.get("important_senders", []))
KEYWORD_WEIGHTS: Dict[str, int] = dict(CFG.get("keyword_weights", {}))
IMPORTANT_MIN_SCORE: int = int(CFG.get("important_min_score", 25))

# Soporte env overrides (opcional)
if "IMPORTANT_MIN_SCORE" in os.environ:
    IMPORTANT_MIN_SCORE = int(os.getenv("IMPORTANT_MIN_SCORE", str(IMPORTANT_MIN_SCORE)))
if "RECENCY_HALF_LIFE_H" in os.environ:
    RECENCY_HALF_LIFE_H = float(os.getenv("RECENCY_HALF_LIFE_H", str(RECENCY_HALF_LIFE_H)))

USE_FAKE_GMAIL = os.getenv("USE_FAKE_GMAIL", "0").lower() in {"1", "true", "yes"}
GMAIL_MAX_RESULTS = int(os.getenv("GMAIL_MAX_RESULTS", "10"))

TZ_SCL = ZoneInfo("America/Santiago") if ZoneInfo else timezone.utc

# Labels a excluir en reales
EXCLUDED_LABELS = {
    "CATEGORY_SOCIAL", "CATEGORY_PROMOTIONS", "CATEGORY_UPDATES",
    "CATEGORY_FORUMS", "SPAM", "TRASH",
}

# ===================== Utilidades comunes =====================

def _headers_lower(meta: Dict[str, Any]) -> Dict[str, str]:
    headers = (meta.get("payload", {}) or {}).get("headers", []) or []
    return {h.get("name", "").lower(): h.get("value", "") for h in headers if isinstance(h, dict)}

def _sender(meta: Dict[str, Any]) -> str:
    h = _headers_lower(meta)
    return (h.get("from") or "").strip()

def _subject(meta: Dict[str, Any]) -> str:
    h = _headers_lower(meta)
    return (h.get("subject") or "").strip()

def _labels_any(meta: Dict[str, Any]) -> List[str]:
    # fixtures (labels) + Gmail real (labelIds)
    lab1 = meta.get("labels") or []
    lab2 = meta.get("labelIds") or []
    labs = set()
    for x in (lab1 or []):
        if isinstance(x, str): labs.add(x.upper())
    for x in (lab2 or []):
        if isinstance(x, str): labs.add(x.upper())
    return list(labs)

def _b64url_to_bytes(data) -> bytes:
    if data is None:
        return b""
    if isinstance(data, (bytes, bytearray)):
        try:
            s = bytes(data)
            s += b"=" * ((4 - len(s) % 4) % 4)
            return base64.urlsafe_b64decode(s)
        except Exception:
            return bytes(data)
    if isinstance(data, str):
        try:
            s = data.encode("ascii")
            s += b"=" * ((4 - len(s) % 4) % 4)
            return base64.urlsafe_b64decode(s)
        except Exception:
            return data.encode("utf-8", errors="ignore")
    return b""

def _strip_html(s: str) -> str:
    if not s:
        return ""
    s = re.sub(r"(?is)<(script|style)[^>]*>.*?</\1\s*>", " ", s)
    s = re.sub(r"(?is)<br\s*/?>", "\n", s)
    s = re.sub(r"(?is)</p\s*>", "\n", s)
    s = re.sub(r"(?is)<[^>]+>", " ", s)
    s = html.unescape(s)
    s = re.sub(r"[ \t]+", " ", s)
    s = re.sub(r"\n{2,}", "\n", s)
    return s.strip()

def _walk_payload(part: Dict[str, Any]) -> Tuple[str, str]:
    if not part:
        return "", ""
    plain_acc, html_acc = "", ""
    mime = (part.get("mimeType") or "").lower()
    body = part.get("body") or {}

    if "data" in body:
        try:
            text = _b64url_to_bytes(body["data"]).decode(errors="ignore")
            if mime.startswith("text/html"):
                html_acc += text
            else:
                plain_acc += text
        except Exception:
            pass

    if "text" in body and isinstance(body["text"], str):
        if mime.startswith("text/html"):
            html_acc += body["text"]
        else:
            plain_acc += body["text"]

    for sp in (part.get("parts") or []):
        p_plain, p_html = _walk_payload(sp)
        plain_acc += p_plain
        html_acc += p_html

    return plain_acc, html_acc

def _extract_text_from_payload(payload: Dict[str, Any]) -> str:
    try:
        plain, html_raw = _walk_payload(payload or {})
    except Exception:
        plain, html_raw = "", ""
    if plain.strip():
        # Si el plain trae tags por error, limpiamos igual
        if "<" in plain and ">" in plain:
            plain = _strip_html(plain)
        return plain.strip()
    if html_raw.strip():
        return _strip_html(html_raw).strip()
    return ""

def _msg_datetime_local(meta: Dict[str, Any]) -> Optional[datetime]:
    """Fecha local del mensaje: ts → header Date → internalDate (ms)."""
    try:
        # ts ISO (fixtures)
        ts_iso = meta.get("ts")
        if isinstance(ts_iso, str) and ts_iso:
            dt = datetime.fromisoformat(ts_iso)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt.astimezone(TZ_SCL) if TZ_SCL else dt

        # Header Date
        h = _headers_lower(meta)
        date_hdr = h.get("date")
        if date_hdr:
            from email.utils import parsedate_to_datetime
            dt = parsedate_to_datetime(date_hdr)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt.astimezone(TZ_SCL) if TZ_SCL else dt

        # internalDate (epoch ms)
        internal = meta.get("internalDate")
        if internal is not None:
            ts_ms = int(internal) if isinstance(internal, str) else int(internal)
            dt = datetime.fromtimestamp(ts_ms / 1000.0, tz=timezone.utc)
            return dt.astimezone(TZ_SCL) if TZ_SCL else dt
        return None
    except Exception:
        return None

def _msg_epoch_ms(meta: Dict[str, Any]) -> int:
    dt = _msg_datetime_local(meta)
    if not dt:
        return 0
    return int(dt.timestamp() * 1000)

def _age_hours(meta: Dict[str, Any], now: Optional[datetime] = None) -> float:
    now_local = now or (datetime.now(TZ_SCL) if TZ_SCL else datetime.now(timezone.utc))
    dt = _msg_datetime_local(meta)
    if not dt:
        return 1e9
    delta = now_local - dt
    return max(0.0, delta.total_seconds() / 3600.0)

def _pretty_age(meta: Dict[str, Any], now: Optional[datetime] = None) -> str:
    ah = _age_hours(meta, now)
    if ah < 1.0:
        m = int(round(ah * 60))
        m = max(m, 1)
        return f"hace {m} min"
    h = int(round(ah))
    return f"hace {h} h"

# ===================== Heurísticas de score =====================

# Señales adicionales (no en KEYWORD_WEIGHTS)
_RE_MONTO = re.compile(r"\$\s?\d[\d\.\,]*")
_RE_HORA  = re.compile(r"\b\d{1,2}:\d{2}\b")
_RE_P1    = re.compile(r"\bP1\b", re.IGNORECASE)

def _normalize_text(meta: Dict[str, Any]) -> str:
    subj = _subject(meta)
    snip = (meta.get("snippet") or "").strip()
    body = _extract_text_from_payload(meta.get("payload") or {})
    # Fallback: algunos fakes guardan cuerpo en meta["body"]
    if not body and isinstance(meta.get("body"), str):
        body = meta["body"]
    text = " ".join(x for x in [subj, snip, body] if x).lower()
    # Colapsar espacios
    text = re.sub(r"[ \t]+", " ", text)
    return text

def _sender_boost(sender: str) -> int:
    s = (sender or "").lower()
    if not s:
        return 0
    boost = 0
    for pat in IMPORTANT_SENDERS:
        p = pat.lower()
        if p.startswith("@"):
            # patrón por dominio
            if p in s or s.endswith(p):
                boost = max(boost, 12)
        else:
            if s == p or p in s:
                boost = max(boost, 15)
    return boost

def _labels_boost(meta: Dict[str, Any]) -> int:
    labs = set(_labels_any(meta))
    score = 0
    if "URGENTE" in labs:
        score += 12
    if "DIRECT" in labs:
        score += 3
    return score

def _keywords_score(text: str) -> int:
    score = 0
    for k, w in KEYWORD_WEIGHTS.items():
        try:
            # coincidencia naive (incluye frases)
            if k.lower() in text:
                score += int(w)
        except Exception:
            continue
    return score

def _business_signals_score(text: str) -> int:
    score = 0
    if _RE_P1.search(text):
        score += 8
    if _RE_MONTO.search(text):
        score += 6
    if _RE_HORA.search(text) or "plazo" in text:
        score += 5
    return score

def _recency_points(age_h: float) -> int:
    # aporte de recencia (0..40 aprox) con decaimiento exponencial
    try:
        return int(round(40.0 * math.exp(-age_h / max(1e-6, RECENCY_HALF_LIFE_H))))
    except Exception:
        return 0

def compute_importance_score(meta: Dict[str, Any], now: Optional[datetime] = None) -> int:
    """Score total = remitente + labels + keywords + señales + recencia."""
    sender = _sender(meta)
    text = _normalize_text(meta)

    base = 0
    base += _sender_boost(sender)
    base += _labels_boost(meta)
    base += _keywords_score(text)
    base += _business_signals_score(text)

    age_h = _age_hours(meta, now)
    rec = _recency_points(age_h)

    total = int(base + rec)
    return max(0, total)

# ===================== Selección Top-N =====================

def seleccionar_importantes(msgs: List[Dict[str, Any]],
                            top_n: int = 3,
                            min_score: Optional[int] = None,
                            now: Optional[datetime] = None) -> List[Tuple[Dict[str, Any], int]]:
    """Devuelve lista [(meta, score)] ordenada por score DESC y fecha DESC."""
    if not msgs:
        return []
    thr = IMPORTANT_MIN_SCORE if min_score is None else int(min_score)
    now_local = now or (datetime.now(TZ_SCL) if TZ_SCL else datetime.now(timezone.utc))

    scored: List[Tuple[Dict[str, Any], int]] = []
    for m in msgs:
        # Excluir labels de ruido en caso real
        if set(m.get("labelIds", []) or []) & EXCLUDED_LABELS:
            continue
        sc = compute_importance_score(m, now_local)
        if sc >= thr:
            scored.append((m, sc))

    # Orden estable: score DESC, luego fecha (epoch ms) DESC
    scored.sort(key=lambda x: (x[1], _msg_epoch_ms(x[0])), reverse=True)
    return scored[:max(1, int(top_n))]

# ===================== Public API (fake/real) =====================

def _primary_query(base_query: Optional[str] = None) -> str:
    parts = [
        "category:primary", "-category:social", "-category:promotions",
        "-category:updates", "-category:forums", "-in:spam", "-in:trash",
    ]
    if base_query:
        parts.append(f"({base_query})")
    return " ".join(parts)

def _list_recent_primary_ids(service, max_results: int, base_query: Optional[str]) -> List[str]:
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
            fields="messages(id),nextPageToken",
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
            fields="id,internalDate,labelIds,snippet,payload(mimeType,body,data,parts,headers(name,value))",
        )
        .execute()
        or {}
    )

def correos_importantes(cantidad: int = 3, newer_than_hours: int = 36) -> str:
    """
    Retorna una lista formateada de correos importantes (fake/real),
    considerando un rango reciente (por defecto 36h) y el umbral de score.
    """
    t0 = time.perf_counter()
    top_k = max(1, min(int(cantidad), GMAIL_MAX_RESULTS))
    now_local = datetime.now(TZ_SCL) if TZ_SCL else datetime.now(timezone.utc)

    # ---------- Rama FAKE ----------
    if USE_FAKE_GMAIL:
        try:
            from utils.fake_gmail import listar  # ordena por fecha desc
        except Exception as e:
            print(f"importantes backend=fake error_import={e}")
            return "No fue posible obtener los correos (fake)."

        try:
            msgs: List[Dict[str, Any]] = listar()  # tomamos todos; filtramos aquí
        except TypeError:
            msgs = listar()  # compat
        # Filtrar por ventana de tiempo (newer_than_hours)
        recent: List[Dict[str, Any]] = []
        for m in msgs:
            dt = _msg_datetime_local(m)
            if not dt:
                continue
            if now_local - dt <= timedelta(hours=newer_than_hours):
                recent.append(m)

        ranked = seleccionar_importantes(recent, top_n=top_k, min_score=IMPORTANT_MIN_SCORE, now=now_local)

        if not ranked:
            dt_ms = (time.perf_counter() - t0) * 1000.0
            print(f"importantes backend=fake items=0 duration_ms={dt_ms:.2f}")
            return "No hay correos importantes recientes."

        lines: List[str] = []
        for meta, score in ranked:
            age = _pretty_age(meta, now_local)
            lines.append(f"• {_sender(meta)} — {_subject(meta)}  [ {age}, score {score} ]")

        dt_ms = (time.perf_counter() - t0) * 1000.0
        print(f"importantes backend=fake items={len(lines)} duration_ms={dt_ms:.2f}")
        return "⚠️ Tienes {} correos importantes:\n\n{}".format(len(lines), "\n".join(lines))

    # ---------- Rama REAL ----------
    try:
        from core.gmail.auth import get_authenticated_service  # type: ignore
        service = get_authenticated_service()
    except Exception as e:
        print(f"importantes backend=real error_service={e}")
        return "No se pudo construir el servicio de Gmail."

    try:
        # buscamos en las últimas ~48h por cobertura
        ids = _list_recent_primary_ids(service, max_results=50, base_query="newer_than:2d")
    except Exception as e:
        print(f"importantes backend=real error_list_ids={e}")
        return "No fue posible listar mensajes recientes."

    msgs: List[Dict[str, Any]] = []
    for mid in ids:
        try:
            m = _get_message_full(service, mid)
        except Exception:
            continue
        if not m:
            continue
        msgs.append(m)

    ranked = seleccionar_importantes(msgs, top_n=top_k, min_score=IMPORTANT_MIN_SCORE, now=now_local)
    if not ranked:
        dt_ms = (time.perf_counter() - t0) * 1000.0
        print(f"importantes backend=real items=0 duration_ms={dt_ms:.2f}")
        return "No hay correos importantes recientes."

    lines: List[str] = []
    for meta, score in ranked:
        age = _pretty_age(meta, now_local)
        lines.append(f"• {_sender(meta)} — {_subject(meta)}  [ {age}, score {score} ]")

    dt_ms = (time.perf_counter() - t0) * 1000.0
    print(f"importantes backend=real items={len(lines)} duration_ms={dt_ms:.2f}")
    return "⚠️ Tienes {} correos importantes:\n\n{}".format(len(lines), "\n".join(lines))
