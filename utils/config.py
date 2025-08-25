# utils/config.py
from __future__ import annotations
import os
import json
import re
from pathlib import Path
from typing import Any, Dict, List, Sequence, Tuple

PROJECT_ROOT = Path(__file__).resolve().parents[1]
CONFIG_FILE = PROJECT_ROOT / "config.json"

CONFIG: Dict[str, Any] = {}

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

def _require(cfg: Dict[str, Any], path: Sequence[str]) -> Any:
    cur: Any = cfg
    for key in path:
        if not isinstance(cur, dict) or key not in cur:
            raise ValueError(f"Falta clave de configuración: {'/'.join(path)}")
        cur = cur[key]
    return cur

def _require_int(cfg: Dict[str, Any], path: Sequence[str], *, min_value: int | None = None, max_value: int | None = None) -> int:
    val = _require(cfg, path)
    try:
        ival = int(val)
    except Exception as e:
        raise ValueError(f"Esperaba int en {'/'.join(path)}, obtuve {val!r}") from e
    if min_value is not None and ival < min_value:
        raise ValueError(f"Valor fuera de rango en {'/'.join(path)}: {ival} < {min_value}")
    if max_value is not None and ival > max_value:
        raise ValueError(f"Valor fuera de rango en {'/'.join(path)}: {ival} > {max_value}")
    return ival

def _require_str(cfg: Dict[str, Any], path: Sequence[str]) -> str:
    val = _require(cfg, path)
    if not isinstance(val, str) or not val.strip():
        raise ValueError(f"Esperaba string no vacío en {'/'.join(path)}")
    return val

def _require_str_list(cfg: Dict[str, Any], path: Sequence[str], *, min_len: int = 0) -> List[str]:
    val = _require(cfg, path)
    if not isinstance(val, list) or any(not isinstance(x, str) for x in val):
        raise ValueError(f"Esperaba lista de strings en {'/'.join(path)}")
    if len(val) < min_len:
        raise ValueError(f"Lista demasiado corta en {'/'.join(path)} (min {min_len})")
    return [x for x in val]

def _setenv_if_missing(key: str, value: Any) -> None:
    if key not in os.environ and value is not None:
        os.environ[key] = str(value)

def _ensure_legacy_env_from_CONFIG(cfg: Dict[str, Any]) -> None:
    app = cfg.get("app", {})
    llm = cfg.get("llm", {})
    gmail = cfg.get("gmail", {})
    summary = cfg.get("summary", {}) or cfg.get("summarizer", {})
    importance = cfg.get("importance", {})
    alerts = cfg.get("alerts", {})

    _setenv_if_missing("HOST", app.get("host", "127.0.0.1"))
    _setenv_if_missing("PORT", app.get("port", 8000))
    _setenv_if_missing("APP_SECRET_KEY", app.get("secret_key", "clave_secreta_123"))

    _setenv_if_missing("LLM_MODE", llm.get("mode", "off"))
    _setenv_if_missing("LLM_MODEL_PATH", llm.get("local_model_path", ""))

    scopes = gmail.get("scopes")
    if isinstance(scopes, list):
        scopes = " ".join(scopes)
    _setenv_if_missing("GMAIL_SCOPES", scopes or "gmail.readonly gmail.modify")
    _setenv_if_missing("GMAIL_MAX_RESULTS", gmail.get("max_results", 10))
    _setenv_if_missing("FAKE_EMAILS_PATH", gmail.get("fake_emails_path", str(PROJECT_ROOT / "tests" / "fixtures" / "emails_home.json")))
    _setenv_if_missing("FAKE_CONTACTS_FILE", gmail.get("fake_contacts_path", str(PROJECT_ROOT / "tests" / "fixtures" / "contacts_retail.json")))
    _setenv_if_missing("GMAIL_PRIMARY_EMAIL", gmail.get("primary_email"))
    _setenv_if_missing("GMAIL_TIMEZONE", gmail.get("timezone", "America/Santiago"))

    _setenv_if_missing("GMAIL_BACKOFF_MAX_TRIES", gmail.get("backoff_max_tries", 3))
    _setenv_if_missing("GMAIL_BACKOFF_BASE_MS", gmail.get("backoff_base_ms", 200))
    _setenv_if_missing("GMAIL_BACKOFF_JITTER_MS", gmail.get("backoff_jitter_ms", 100))

    if gmail.get("fields_list"):
        _setenv_if_missing("GMAIL_FIELDS_LIST", gmail["fields_list"])
    if gmail.get("fields_get"):
        _setenv_if_missing("GMAIL_FIELDS_GET", gmail["fields_get"])
    if gmail.get("headers_get"):
        try:
            os.environ.setdefault("GMAIL_HEADERS_GET", json.dumps(gmail["headers_get"], ensure_ascii=False))
        except Exception:
            pass

    _setenv_if_missing("GMAIL_CONCURRENCY_GET", gmail.get("concurrency_get", 4))
    _setenv_if_missing("GMAIL_CACHE_TTL_SECONDS", gmail.get("cache_ttl_seconds", 60))

    # Breaker (ENV opcional para diagnósticos)
    cb = gmail.get("circuit_breaker", {})
    _setenv_if_missing("GMAIL_CB_ENABLED", str(cb.get("enabled", True)))
    _setenv_if_missing("GMAIL_CB_THRESHOLD", cb.get("threshold", 3))
    _setenv_if_missing("GMAIL_CB_COOLDOWN_S", cb.get("cooldown_seconds", 30))

    if "USE_FAKE_GMAIL" not in os.environ:
        fake_path = os.getenv("FAKE_EMAILS_PATH")
        os.environ["USE_FAKE_GMAIL"] = "1" if fake_path and Path(fake_path).exists() else "0"

    _setenv_if_missing("SUMMARY_CHUNK_BYTES", summary.get("chunk_bytes", 2048))
    _setenv_if_missing("SUMMARY_CHUNK_OVERLAP", summary.get("chunk_overlap", 200))
    _setenv_if_missing("SUMMARY_MAX_CHARS", summary.get("max_chars", 280))
    _setenv_if_missing("SUMMARY_FORCE_ONE_SENTENCE", "1" if summary.get("force_one_sentence", True) else "0")

    kw = importance.get("keyword_weights")
    if isinstance(kw, dict):
        os.environ.setdefault("KEYWORD_WEIGHTS", json.dumps(kw, ensure_ascii=False))
    senders = importance.get("important_senders")
    if isinstance(senders, list):
        os.environ.setdefault("IMPORTANT_SENDERS", json.dumps(senders, ensure_ascii=False))
    _setenv_if_missing("IMPORTANCE_RECENCY_HALF_LIFE_H", importance.get("recency_half_life_h", 48))
    _setenv_if_missing("IMPORTANCE_BODY_PREVIEW_CHARS", importance.get("body_preview_chars", 500))

    crit = alerts.get("critical_keywords")
    if isinstance(crit, list):
        try:
            os.environ.setdefault("CRITICAL_KEYWORDS", json.dumps(crit, ensure_ascii=False))
        except Exception:
            pass

def load_config(path: str | Path = CONFIG_FILE) -> None:
    global CONFIG
    path = Path(path)
    if not path.exists():
        print(f"⚠️ Config file no encontrado: {path}")
        CONFIG = {}
        return
    try:
        with open(path, "r", encoding="utf-8") as f:
            cfg = json.load(f)
    except Exception as e:
        print(f"❌ Error leyendo {path}: {e}")
        CONFIG = {}
        return
    CONFIG = cfg or {}
    _ensure_legacy_env_from_CONFIG(CONFIG)
    print(f"✅ Configuración cargada desde {path} ({len(CONFIG.keys())} secciones)")

def get_fake_emails_path() -> Path:
    env_path = os.getenv("FAKE_EMAILS_PATH") or os.getenv("FAKE_EMAILS_FILE")
    return Path(env_path) if env_path else PROJECT_ROOT / "tests" / "fixtures" / "emails_home.json"

def get_fake_contacts_path() -> Path:
    env_path = os.getenv("FAKE_CONTACTS_FILE")
    return Path(env_path) if env_path else PROJECT_ROOT / "tests" / "fixtures" / "contacts_retail.json"

def gmail_max_results(cfg: Dict[str, Any] | None = None) -> int:
    cfg = CONFIG if cfg is None else cfg
    return _require_int(cfg, ["gmail", "max_results"], min_value=1)

def gmail_backoff_max_tries(cfg: Dict[str, Any] | None = None) -> int:
    cfg = CONFIG if cfg is None else cfg
    return _require_int(cfg, ["gmail", "backoff_max_tries"], min_value=1, max_value=5)

def gmail_backoff_base_ms(cfg: Dict[str, Any] | None = None) -> int:
    cfg = CONFIG if cfg is None else cfg
    return _require_int(cfg, ["gmail", "backoff_base_ms"], min_value=50)

def gmail_backoff_jitter_ms(cfg: Dict[str, Any] | None = None) -> int:
    cfg = CONFIG if cfg is None else cfg
    return _require_int(cfg, ["gmail", "backoff_jitter_ms"], min_value=0)

def gmail_fields_list(cfg: Dict[str, Any] | None = None) -> str:
    cfg = CONFIG if cfg is None else cfg
    return _require_str(cfg, ["gmail", "fields_list"])

def gmail_fields_get(cfg: Dict[str, Any] | None = None) -> str:
    cfg = CONFIG if cfg is None else cfg
    return _require_str(cfg, ["gmail", "fields_get"])

def gmail_headers_get(cfg: Dict[str, Any] | None = None) -> List[str]:
    cfg = CONFIG if cfg is None else cfg
    return _require_str_list(cfg, ["gmail", "headers_get"], min_len=1)

def gmail_excluded_labels(cfg: Dict[str, Any] | None = None) -> List[str]:
    cfg = CONFIG if cfg is None else cfg
    val = cfg.get("gmail", {}).get("excluded_labels", [])
    if not isinstance(val, list) or any(not isinstance(x, str) for x in val):
        return []
    return val

def gmail_primary_email(cfg: Dict[str, Any] | None = None) -> str | None:
    cfg = CONFIG if cfg is None else cfg
    val = cfg.get("gmail", {}).get("primary_email")
    return str(val) if isinstance(val, str) and val.strip() else None

def gmail_timezone(cfg: Dict[str, Any] | None = None) -> str:
    cfg = CONFIG if cfg is None else cfg
    tz = cfg.get("gmail", {}).get("timezone", "America/Santiago")
    return str(tz)

def gmail_scopes(cfg: Dict[str, Any] | None = None) -> List[str]:
    cfg = CONFIG if cfg is None else cfg
    scopes = cfg.get("gmail", {}).get("scopes", [])
    return [str(s) for s in scopes] if isinstance(scopes, list) else []

def gmail_calendar_scopes(cfg: Dict[str, Any] | None = None) -> List[str]:
    cfg = CONFIG if cfg is None else cfg
    scopes = cfg.get("gmail", {}).get("calendar_scopes", [])
    return [str(s) for s in scopes] if isinstance(scopes, list) else []

def gmail_concurrency_get(cfg: Dict[str, Any] | None = None) -> int:
    cfg = CONFIG if cfg is None else cfg
    try:
        return _require_int(cfg, ["gmail", "concurrency_get"], min_value=1, max_value=16)
    except Exception:
        return 4

def gmail_cache_ttl_seconds(cfg: Dict[str, Any] | None = None) -> int:
    cfg = CONFIG if cfg is None else cfg
    try:
        ttl = int(cfg.get("gmail", {}).get("cache_ttl_seconds", 60))
        return max(0, min(ttl, 600))
    except Exception:
        return 60

# --- Circuit Breaker getters ---
def gmail_cb_enabled(cfg: Dict[str, Any] | None = None) -> bool:
    cfg = CONFIG if cfg is None else cfg
    return bool(cfg.get("gmail", {}).get("circuit_breaker", {}).get("enabled", True))

def gmail_cb_threshold(cfg: Dict[str, Any] | None = None) -> int:
    cfg = CONFIG if cfg is None else cfg
    try:
        return _require_int(cfg, ["gmail", "circuit_breaker", "threshold"], min_value=1, max_value=20)
    except Exception:
        return 3

def gmail_cb_cooldown_s(cfg: Dict[str, Any] | None = None) -> int:
    cfg = CONFIG if cfg is None else cfg
    try:
        return _require_int(cfg, ["gmail", "circuit_breaker", "cooldown_seconds"], min_value=5, max_value=600)
    except Exception:
        return 30

def get_gmail_settings() -> Dict[str, Any]:
    return {
        "max_results": gmail_max_results(),
        "backoff_max_tries": gmail_backoff_max_tries(),
        "backoff_base_ms": gmail_backoff_base_ms(),
        "backoff_jitter_ms": gmail_backoff_jitter_ms(),
        "fields_list": gmail_fields_list(),
        "fields_get": gmail_fields_get(),
        "headers_get": gmail_headers_get(),
        "excluded_labels": gmail_excluded_labels(),
        "primary_email": gmail_primary_email(),
        "timezone": gmail_timezone(),
        "scopes": gmail_scopes(),
        "calendar_scopes": gmail_calendar_scopes(),
        "concurrency_get": gmail_concurrency_get(),
        "cache_ttl_seconds": gmail_cache_ttl_seconds(),
        # Breaker:
        "cb_enabled": gmail_cb_enabled(),
        "cb_threshold": gmail_cb_threshold(),
        "cb_cooldown_s": gmail_cb_cooldown_s(),
    }

def get_summary_settings() -> Dict[str, Any]:
    s_cfg = CONFIG.get("summary") or CONFIG.get("summarizer") or {}
    return {
        "chunk_bytes": int(s_cfg.get("chunk_bytes", os.getenv("SUMMARY_CHUNK_BYTES", 2048))),
        "chunk_overlap": int(s_cfg.get("chunk_overlap", os.getenv("SUMMARY_CHUNK_OVERLAP", 200))),
        "max_chars": int(s_cfg.get("max_chars", os.getenv("SUMMARY_MAX_CHARS", 280))),
        "force_one_sentence": bool(s_cfg.get("force_one_sentence", (os.getenv("SUMMARY_FORCE_ONE_SENTENCE", "1") == "1"))),
    }

def get_keyword_weights() -> Dict[str, int]:
    imp = CONFIG.get("importance", {})
    kw = imp.get("keyword_weights")
    if isinstance(kw, dict):
        try:
            return {str(k).lower(): int(v) for k, v in kw.items()}
        except Exception:
            pass
    raw = os.getenv("KEYWORD_WEIGHTS", "{}")
    try:
        data = json.loads(raw)
        return {str(k).lower(): int(v) for k, v in data.items()}
    except Exception:
        return {}

def get_importance_senders() -> List[str]:
    imp = CONFIG.get("importance", {})
    senders = imp.get("important_senders")
    if isinstance(senders, list):
        return [str(s) for s in senders]
    raw = os.getenv("IMPORTANT_SENDERS", "[]")
    try:
        return list(json.loads(raw))
    except Exception:
        return []

def get_critical_keywords() -> List[str]:
    alerts = CONFIG.get("alerts", {})
    crit = alerts.get("critical_keywords")
    if isinstance(crit, list):
        return [str(x).strip().lower() for x in crit if str(x).strip()]
    raw = os.getenv("CRITICAL_KEYWORDS", "[]")
    try:
        data = json.loads(raw)
        if isinstance(data, list):
            return [str(x).strip().lower() for x in data if str(x).strip()]
    except Exception:
        pass
    return []

def _validate_paths_exist(gmail: Dict[str, Any]) -> List[str]:
    errs: List[str] = []
    f_emails = gmail.get("fake_emails_path")
    if isinstance(f_emails, str) and f_emails.strip() and not Path(f_emails).exists():
        errs.append(f"gmail.fake_emails_path no existe: {f_emails}")
    f_contacts = gmail.get("fake_contacts_path")
    if isinstance(f_contacts, str) and f_contacts.strip() and not Path(f_contacts).exists():
        errs.append(f"gmail.fake_contacts_path no existe: {f_contacts}")
    return errs

def validate(cfg: Dict[str, Any]) -> Tuple[bool, List[str], List[str]]:
    errors: List[str] = []
    warnings: List[str] = []

    if not isinstance(cfg, dict):
        return False, ["config no es un objeto"], warnings
    gmail = cfg.get("gmail", {})
    if not isinstance(gmail, dict):
        return False, ["falta objeto gmail"], warnings

    scopes = gmail.get("scopes")
    if not isinstance(scopes, list) or not scopes:
        errors.append("gmail.scopes debe ser una lista no vacía.")

    primary_email = gmail.get("primary_email")
    if not isinstance(primary_email, str) or not _EMAIL_RE.match(primary_email or ""):
        errors.append("gmail.primary_email no es un email válido.")

    timezone = gmail.get("timezone")
    if not isinstance(timezone, str) or not timezone.strip():
        errors.append("gmail.timezone debe ser un string no vacío.")

    mr = gmail.get("max_results")
    if not isinstance(mr, int) or not (1 <= mr <= 100):
        errors.append("gmail.max_results debe ser int en rango 1..100.")

    btries = gmail.get("backoff_max_tries")
    if not isinstance(btries, int) or btries < 1:
        errors.append("gmail.backoff_max_tries debe ser >= 1.")

    bbase = gmail.get("backoff_base_ms")
    if not isinstance(bbase, int) or bbase < 0:
        errors.append("gmail.backoff_base_ms debe ser >= 0.")

    bjit = gmail.get("backoff_jitter_ms")
    if not isinstance(bjit, int) or bjit < 0:
        errors.append("gmail.backoff_jitter_ms debe ser >= 0.")

    flist = gmail.get("fields_list")
    if not isinstance(flist, str) or not flist.strip():
        errors.append("gmail.fields_list debe ser string no vacío.")

    fget = gmail.get("fields_get")
    if not isinstance(fget, str) or not fget.strip():
        errors.append("gmail.fields_get debe ser string no vacío.")

    hget = gmail.get("headers_get")
    if not isinstance(hget, list):
        errors.append("gmail.headers_get debe ser una lista (puede estar vacía).")

    conc = gmail.get("concurrency_get", 4)
    if not isinstance(conc, int) or not (1 <= conc <= 16):
        errors.append("gmail.concurrency_get debe ser int en rango 1..16.")
    elif conc > 8:
        warnings.append("gmail.concurrency_get > 8 puede gatillar 429 en picos.")

    ttl = gmail.get("cache_ttl_seconds", 60)
    if not isinstance(ttl, int) or ttl < 0 or ttl > 600:
        errors.append("gmail.cache_ttl_seconds debe ser int en rango 0..600.")

    # Breaker
    cb = gmail.get("circuit_breaker", {})
    if not isinstance(cb, dict):
        errors.append("gmail.circuit_breaker debe ser un objeto.")
    else:
        th = cb.get("threshold", 3)
        cd = cb.get("cooldown_seconds", 30)
        en = cb.get("enabled", True)
        if not isinstance(en, bool):
            errors.append("gmail.circuit_breaker.enabled debe ser boolean.")
        if not isinstance(th, int) or th < 1 or th > 20:
            errors.append("gmail.circuit_breaker.threshold debe ser int 1..20.")
        if not isinstance(cd, int) or cd < 5 or cd > 600:
            errors.append("gmail.circuit_breaker.cooldown_seconds debe ser int 5..600.")

    if isinstance(mr, int) and mr > 50:
        warnings.append("gmail.max_results > 50 puede impactar latencia.")
    if isinstance(bbase, int) and bbase < 100:
        warnings.append("gmail.backoff_base_ms < 100 ms puede ser agresivo en real.")
    if isinstance(timezone, str) and timezone.strip() and timezone != "America/Santiago":
        warnings.append("gmail.timezone distinto a America/Santiago (solo aviso).")

    errors.extend(_validate_paths_exist(gmail))
    return (len(errors) == 0), errors, warnings
