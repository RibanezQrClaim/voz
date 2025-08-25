# utils/summarizer.py
from typing import List, Dict, Any, Optional, Tuple
import os, re, base64, html, time
from datetime import datetime, timezone, timedelta

try:
    from zoneinfo import ZoneInfo  # En Windows: pip install tzdata
except Exception:
    ZoneInfo = None

# ====================== Config ======================

# Config runtime (no depender de envs sueltas)
try:
    from utils.config import get_config  # lee config.json
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

# Gmail / entorno
PRIMARY_EMAIL: str = (_cfg("gmail.primary_email", "carolina@home.cl") or "").lower()
TIMEZONE_STR: str = _cfg("gmail.timezone", "America/Santiago")
GMAIL_MAX_RESULTS: int = int(_cfg("gmail.max_results", 10))

# Summarizer params
SUMMARY_MAX_CHARS: int = int(_cfg("summarizer.max_chars", 280))         # límite contrato
SUMMARY_INPUT_CHARS: int = int(_cfg("summarizer.input_chars", 1200))     # contexto para limpiar
SUMMARY_CHUNK_BYTES: int = int(_cfg("summarizer.chunk_bytes", 2048))
SUMMARY_CHUNK_OVERLAP: int = int(_cfg("summarizer.chunk_overlap", 200))
SUMMARY_FORCE_ONE_SENTENCE: bool = bool(_cfg("summarizer.force_one_sentence", True))

# Modo LLM (se apaga en fake)
LLM_MODE: str = str(_cfg("llm.mode", "off")).lower()

# Selector fake: mantenemos por ENV para flexibilidad local
USE_FAKE_GMAIL = os.getenv("USE_FAKE_GMAIL", "0").lower() in {"1", "true", "yes"}
if USE_FAKE_GMAIL:
    LLM_MODE = "off"

TZ_SCL = ZoneInfo(TIMEZONE_STR) if ZoneInfo else timezone.utc

# LLM local (opcional). Si falla, devolvemos None para forzar fallback.
try:
    from core.llm.llm_client import parafrasear_una_oracion
except Exception:
    def parafrasear_una_oracion(texto: str, max_chars: int = 220) -> Optional[str]:
        return None

# --- Campos de Gmail (modo real) ---
if not USE_FAKE_GMAIL:
    from core.gmail.auth import get_authenticated_service  # noqa: F401

MESSAGE_FIELDS_LIST = "messages(id),nextPageToken"
MESSAGE_FIELDS_GET_FULL = (
    "id,internalDate,labelIds,snippet,"
    "payload(mimeType,body/data,parts,headers(name,value))"
)

# Excluir categorías no primarias
EXCLUDED_LABELS = {
    "CATEGORY_SOCIAL", "CATEGORY_PROMOTIONS", "CATEGORY_UPDATES",
    "CATEGORY_FORUMS", "SPAM", "TRASH",
}

# ====================== Utils comunes ======================

def _b64url_to_bytes(data) -> bytes:
    """Intenta decodificar base64-url; si falla, trata el input como texto UTF-8."""
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
    """Quita tags HTML, remueve script/style, decodifica entidades y colapsa espacios."""
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

# -------- payload (plain/html) --------

def _walk_payload(part: Dict[str, Any]) -> Tuple[str, str]:
    """Extrae texto plano y HTML del payload. Tolera base64-url/text y recorre subpartes."""
    if not part:
        return "", ""
    plain_acc, html_acc = "", ""

    mime = (part.get("mimeType") or "").lower()
    body = part.get("body") or {}

    # 1) body.data (base64-url o texto crudo)
    if "data" in body:
        try:
            text = _b64url_to_bytes(body["data"]).decode(errors="ignore")
            if mime.startswith("text/html"):
                html_acc += text
            elif mime.startswith("text/plain") or not mime:
                plain_acc += text
            else:
                plain_acc += text
        except Exception:
            pass

    # 2) body.text (ya decodificado)
    if "text" in body and isinstance(body["text"], str):
        if mime.startswith("text/html"):
            html_acc += body["text"]
        else:
            plain_acc += body["text"]

    # 3) Subpartes
    for sp in (part.get("parts") or []):
        p_plain, p_html = _walk_payload(sp)
        plain_acc += p_plain
        html_acc += p_html

    return plain_acc, html_acc

def _extract_text_from_payload(payload: Dict[str, Any]) -> str:
    try:
        plain, html_raw = _walk_payload(payload)
    except Exception:
        plain, html_raw = "", ""
    if plain.strip():
        # si el "plain" trae tags, igual los removemos
        if "<" in plain and ">" in plain:
            plain = _strip_html(plain)
        return plain.strip()
    if html_raw.strip():
        return _strip_html(html_raw).strip()
    return ""

def _headers_lower(meta: Dict[str, Any]) -> Dict[str, str]:
    headers = (meta.get("payload", {}) or {}).get("headers", []) or []
    return {h.get("name", "").lower(): h.get("value", "") for h in headers if isinstance(h, dict)}

def _msg_datetime_local(meta: Dict[str, Any]) -> Optional[datetime]:
    """Fecha del mensaje: ts (fixtures) → Date header → internalDate. Devuelve timezone de config."""
    try:
        # 0) ts (ISO en fixtures fake)
        ts_iso = meta.get("ts")
        if isinstance(ts_iso, str) and ts_iso:
            try:
                dt = datetime.fromisoformat(ts_iso)
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                return dt.astimezone(TZ_SCL) if TZ_SCL else dt
            except Exception:
                pass

        # 1) Header Date
        hdrs = _headers_lower(meta)
        date_hdr = hdrs.get("date")
        if date_hdr:
            from email.utils import parsedate_to_datetime
            dt = parsedate_to_datetime(date_hdr)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt.astimezone(TZ_SCL) if TZ_SCL else dt

        # 2) internalDate (epoch ms)
        internal = meta.get("internalDate")
        if internal is not None:
            ts_ms = int(internal) if isinstance(internal, str) else int(internal)
            dt = datetime.fromtimestamp(ts_ms / 1000.0, tz=timezone.utc)
            return dt.astimezone(TZ_SCL) if TZ_SCL else dt
        return None
    except Exception:
        return None

# -------- Limpieza de texto del cuerpo --------

RE_QUOTED = re.compile(r"(?im)^(>+|el\s+.+\sescribió:|on\s+.+\swrote:).*$")
RE_SIG = re.compile(r"(?m)^--\s*$.*", re.DOTALL)
RE_DISCLAIMER = re.compile(r"(?is)(este mensaje.*confidencial|this message.*confidential).*$")
RE_URL = re.compile(r"https?://\S+")
RE_WS = re.compile(r"[ \t]+")
RE_LINES = re.compile(r"\n{2,}")

def _clean(text: str) -> str:
    if not text:
        return ""
    t = text[:SUMMARY_INPUT_CHARS]
    t = RE_DISCLAIMER.sub("", t)
    t = "\n".join(l for l in t.splitlines() if not RE_QUOTED.match(l.strip()))
    t = RE_SIG.sub("", t)
    t = RE_URL.sub("", t)
    t = RE_WS.sub(" ", t)
    t = RE_LINES.sub("\n", t)
    return t.strip()

def _too_similar(src: str, out: str) -> bool:
    if not src or not out:
        return False
    s = set(re.findall(r"\w+", src.lower()))
    o = set(re.findall(r"\w+", out.lower()))
    if not s or not o:
        return out.lower() in src.lower()
    overlap = len(s & o) / max(1, len(o))
    return (out.lower() in src.lower()) or (overlap > 0.85)

# ====================== Una sola oración ======================

ABBR = {"sr.", "sra.", "dr.", "dra.", "ing.", "lic.", "ee.uu.", "p.ej.", "etc."}

def _tidy_sentence(s: str) -> str:
    if not s:
        return s
    s = " ".join(s.split())
    s = s.replace(" ,", ",").replace(" .", ".")
    s = s.strip(" \"'–—-")
    if s and s[0].islower():
        s = s[0].upper() + s[1:]
    if s and s[-1].isalnum():
        s += "."
    return s

def _first_meaningful_sentence(s: str) -> str:
    if not s:
        return s
    buf = []
    for i, ch in enumerate(s):
        buf.append(ch)
        if ch in ".!?":
            frag = "".join(buf).strip()
            tail = s[i+1:i+3].strip().lower()
            last = frag.lower().split()[-1] if frag.split() else ""
            if last in ABBR:
                continue
            if ch == "." and tail[:1].isdigit():  # "v1.2" etc.
                continue
            return frag
    return s.strip()

# -------- Corte inteligente (no cortar palabras) --------

_RE_BOUNDARY = re.compile(r"[.,;:!?]\s|\s")

def _smart_cut(s: str, limit: int) -> str:
    """Corta s en el último límite natural (puntuación/espacio) ≤ limit. Añade '…' si recorta."""
    if len(s) <= limit:
        return s
    cut_zone = s[:limit]
    matches = list(_RE_BOUNDARY.finditer(cut_zone))
    if matches:
        end = matches[-1].end()
        trimmed = cut_zone[:end].rstrip()
    else:
        trimmed = cut_zone.rstrip()
    return trimmed + "…"

def _enforce_one_sentence(s: str, budget: int) -> str:
    if not s:
        return s
    s1 = _first_meaningful_sentence(s)
    s1 = _tidy_sentence(s1)
    return _smart_cut(s1, budget) if len(s1) > budget else s1

# ====================== Chunking ======================

def _utf8_len(s: str) -> int:
    return len((s or "").encode("utf-8", errors="ignore"))

_SENT_SPLIT = re.compile(r"(?<=[\.\!\?])\s+")
_PAR_SPLIT = re.compile(r"\n{2,}")

def _split_natural(text: str) -> List[str]:
    """Divide por párrafos; si un párrafo excede el umbral, lo corta por oraciones."""
    if not text:
        return []
    parts: List[str] = []
    for para in _PAR_SPLIT.split(text):
        para = para.strip()
        if not para:
            continue
        if _utf8_len(para) <= SUMMARY_CHUNK_BYTES:
            parts.append(para)
        else:
            sent_acc: List[str] = []
            cur = ""
            for sent in _SENT_SPLIT.split(para):
                cand = (cur + " " + sent).strip() if cur else sent
                if _utf8_len(cand) <= SUMMARY_CHUNK_BYTES:
                    cur = cand
                else:
                    if cur:
                        sent_acc.append(cur)
                    cur = sent
            if cur:
                sent_acc.append(cur)
            parts.extend(sent_acc)
    return parts

def chunk_text_if_needed(text: str) -> List[str]:
    """Retorna [text] si no excede SUMMARY_CHUNK_BYTES; si excede, divide y aplica overlap."""
    if not text:
        return []
    if _utf8_len(text) <= SUMMARY_CHUNK_BYTES:
        return [text]
    base_parts = _split_natural(text) or [text]
    chunks: List[str] = []
    prev_tail = ""
    for p in base_parts:
        p = p.strip()
        if not p:
            continue
        prefix = ""
        if prev_tail and SUMMARY_CHUNK_OVERLAP > 0:
            tail = prev_tail.encode("utf-8", errors="ignore")[-SUMMARY_CHUNK_OVERLAP:]
            try:
                prefix = tail.decode("utf-8", errors="ignore")
            except Exception:
                prefix = ""
        joined = (prefix + " " + p).strip() if prefix else p
        chunks.append(joined)
        prev_tail = p
    return chunks

# ====================== Resumen (LLM + fallback) ======================

def _summarize_one(text: str, budget: int) -> str:
    """
    Resume en 1 oración (≤ budget). Si hay LLM local, lo usa; si no, fallback extractivo.
    """
    text = (text or "").strip()
    if not text:
        return ""
    out: Optional[str] = None
    if LLM_MODE == "local":
        try:
            out = parafrasear_una_oracion(texto=text, max_chars=budget)
        except Exception:
            out = None
    if out:
        # Limpieza de encabezados tipo "Resumen:"
        out = re.sub(r"^#+\s*resumen.*?:\s*", "", out, flags=re.IGNORECASE)
        out = re.sub(r"^(resumen\s*:)\s*", "", out, flags=re.IGNORECASE)
    # Post-proceso o fallback
    out = _enforce_one_sentence(out or text, budget)
    return out

def summarize_chunks(chunks: List[str], budget: int) -> List[str]:
    """Resume cada chunk en 1 oración (≤ budget)."""
    results: List[str] = []
    for ch in chunks:
        s = _summarize_one(ch, budget)
        if s:
            results.append(s)
    return results

def merge_chunk_summaries(summaries: List[str], budget: int) -> str:
    """
    Fusiona mini-resúmenes en una sola oración (≤ budget).
    Estrategia simple: unir con '; ' y volver a resumir 1 oración.
    """
    if not summaries:
        return ""
    if len(summaries) == 1:
        return _enforce_one_sentence(summaries[0], budget)
    fused = "; ".join(summaries)
    return _summarize_one(fused, budget)

# ====================== Composición de ítem ======================

def _compose_item(meta: Dict[str, Any], clean_body: str) -> Optional[str]:
    if not meta:
        return None
    headers = _headers_lower(meta)
    frm = (headers.get("from") or "").strip()
    subject = (headers.get("subject") or "").strip()
    snippet = (meta.get("snippet") or "").strip()
    base_text = clean_body if clean_body else snippet

    hdr = f"De: {frm} | Asunto: {subject} — "
    budget = max(60, SUMMARY_MAX_CHARS - len(hdr))

    # Pipeline con chunking + fusión
    summary: Optional[str] = None
    text = (base_text or "").strip()

    if text:
        if _utf8_len(text) > SUMMARY_CHUNK_BYTES:
            chunks = chunk_text_if_needed(text)
            mini = summarize_chunks(chunks, budget)
            summary = merge_chunk_summaries(mini, budget)
        else:
            summary = _summarize_one(text, budget)
        if summary and _too_similar(text, summary):
            summary = None  # fuerza fallback extractivo

    if not summary:
        summary = _enforce_one_sentence(text or "(Sin contenido)", budget)

    if SUMMARY_FORCE_ONE_SENTENCE and summary:
        summary = _enforce_one_sentence(summary, budget)

    out = (hdr + (summary or "")).strip()
    return _smart_cut(out, SUMMARY_MAX_CHARS)

# ====================== Gmail REAL helpers ======================

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

# ====================== Filtro por fecha & helpers ======================

def _is_to_me(meta: Dict[str, Any]) -> bool:
    """True si el correo va dirigido al PRIMARY_EMAIL (header o campo top-level)."""
    hdrs = _headers_lower(meta)
    to_hdr = (hdrs.get("to") or "").lower()
    if PRIMARY_EMAIL in to_hdr:
        return True
    # Fallback para fixtures: campo top-level "to": [...]
    to_list = meta.get("to") or []
    for x in to_list:
        if isinstance(x, str) and PRIMARY_EMAIL in x.lower():
            return True
    return False

def _filter_messages_for_date(msgs: List[Dict[str, Any]], target_date: datetime.date) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    for meta in msgs:
        # respetar flag del fixture (cc_only)
        if meta.get("meta", {}).get("cc_only", False):
            continue
        dt_local = _msg_datetime_local(meta)
        if not (dt_local and dt_local.date() == target_date):
            continue
        if not _is_to_me(meta):
            continue
        out.append(meta)
    return out

def _format_list(items: List[Dict[str, Any]]) -> str:
    if not items:
        return "No hay correos para la fecha indicada."
    lines: List[str] = []
    for meta in items:
        body = _extract_text_from_payload(meta.get("payload") or {})
        clean = _clean(body)
        formatted = _compose_item(meta, clean)
        if formatted:
            lines.append(formatted)
    return "\n-----\n".join(lines) if lines else "No hay correos para la fecha indicada."

# ====================== Endpoints de resumen ======================

def _resumen_para_fecha(target_date: datetime.date, cantidad: int = 10) -> str:
    """Motor común para HOY/AYER, soporta fake y real."""
    t0 = time.perf_counter()
    n = max(1, min(int(cantidad), GMAIL_MAX_RESULTS))

    # --- FAKE ---
    if USE_FAKE_GMAIL:
        try:
            from utils.fake_gmail import listar  # ordena por fecha desc
        except Exception as e:
            print(f"resumen_fecha backend=fake error_import={e}")
            return "No fue posible obtener los correos (fake)."

        try:
            all_msgs: List[Dict[str, Any]] = listar()  # TRAE TODOS
        except TypeError:
            all_msgs = listar()  # compat firma

        filtered = _filter_messages_for_date(all_msgs, target_date)

        # Orden explícito por fecha desc (por si acaso)
        filtered.sort(
            key=lambda m: (_msg_datetime_local(m) or datetime.min.replace(tzinfo=timezone.utc)),
            reverse=True
        )

        items = filtered[:n]  # aplicar límite después del filtro
        print(f"[DEBUG] correos_fecha={target_date.isoformat()} detectados={len(items)} (fake)")

        out = _format_list(items)
        dt_ms = (time.perf_counter() - t0) * 1000.0
        print(f"resumen_fecha backend=fake items={len(items)} duration_ms={dt_ms:.2f}")
        return out if items else "No hay correos para la fecha indicada."

    # --- REAL ---
    try:
        from core.gmail.auth import get_authenticated_service  # lazy import
        service = get_authenticated_service()
    except Exception as e:
        print(f"resumen_fecha backend=real error_service={e}")
        return "No se pudo construir el servicio de Gmail."

    # Traemos ~2d y filtramos por fecha exacta local
    try:
        ids = _list_primary_message_ids(service, n, base_query="newer_than:2d")
    except Exception as e:
        print(f"resumen_fecha backend=real error_list_ids={e}")
        return "No fue posible listar mensajes recientes."

    if not ids:
        return "No hay correos para la fecha indicada."

    msgs: List[Dict[str, Any]] = []
    for mid in ids:
        try:
            meta = _get_message_full(service, mid)
        except Exception:
            continue
        if not meta:
            continue
        if set(meta.get("labelIds", []) or []) & EXCLUDED_LABELS:
            continue
        msgs.append(meta)

    items = _filter_messages_for_date(msgs, target_date)
    out = _format_list(items)
    dt_ms = (time.perf_counter() - t0) * 1000.0
    print(f"resumen_fecha backend=real items={len(items)} duration_ms={dt_ms:.2f}")
    return out if items else "No hay correos para la fecha indicada."

def resumen_correos_hoy(cantidad: int = 10) -> str:
    now_local = datetime.now(TZ_SCL) if TZ_SCL else datetime.now(timezone.utc)
    return _resumen_para_fecha(now_local.date(), cantidad=cantidad)

def resumen_correos_ayer(cantidad: int = 10) -> str:
    now_local = datetime.now(TZ_SCL) if TZ_SCL else datetime.now(timezone.utc)
    yday = (now_local - timedelta(days=1)).date()
    return _resumen_para_fecha(yday, cantidad=cantidad)
