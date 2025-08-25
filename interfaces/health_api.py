# interfaces/health_api.py
from __future__ import annotations

import json
import os
import re
import time
from pathlib import Path
from typing import Any, Dict, List, Tuple

from flask import Blueprint, jsonify

try:
    from utils.version import VERSION  # opcional
except Exception:
    VERSION = "v0.3.0-f4"

# ----------------------- Carga/validación de config --------------------------
def _load_config() -> Dict[str, Any]:
    """
    Intenta usar utils.config.load_config() y luego leer utils.config.CONFIG.
    Si no hay CONFIG, cae a leer ./config.json directamente.
    """
    # 1) Intentar vía utils.config
    try:
        from utils.config import load_config, CONFIG  # type: ignore
        load_config()  # puede no retornar dict; rellena CONFIG global
        if isinstance(CONFIG, dict) and CONFIG:
            return CONFIG
    except Exception:
        pass

    # 2) Fallback: leer archivo config.json
    cfg_path = Path(os.getcwd()) / "config.json"
    if not cfg_path.exists():
        raise FileNotFoundError(f"No se encontró {cfg_path.as_posix()}")
    with cfg_path.open("r", encoding="utf-8") as f:
        return json.load(f)

def _validate_with_utils(cfg: Dict[str, Any]) -> Tuple[bool, List[str], List[str]]:
    """
    Usa utils.config.validate(cfg) si existe; si falla, aplica guard local.
    """
    try:
        from utils.config import validate  # type: ignore
        ok, errors, warnings = validate(cfg or {})
        return bool(ok), list(errors or []), list(warnings or [])
    except Exception:
        return _local_validate(cfg or {})

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

def _local_validate(cfg: Dict[str, Any]) -> Tuple[bool, List[str], List[str]]:
    errors: List[str] = []
    warnings: List[str] = []

    gmail = cfg.get("gmail", {}) if isinstance(cfg, dict) else {}

    scopes = gmail.get("scopes")
    primary_email = gmail.get("primary_email")
    timezone = gmail.get("timezone")
    max_results = gmail.get("max_results")
    backoff_max_tries = gmail.get("backoff_max_tries")
    backoff_base_ms = gmail.get("backoff_base_ms")
    backoff_jitter_ms = gmail.get("backoff_jitter_ms")
    fields_list = gmail.get("fields_list")
    fields_get = gmail.get("fields_get")
    headers_get = gmail.get("headers_get", [])

    if not isinstance(scopes, list) or not scopes:
        errors.append("gmail.scopes debe ser una lista no vacía.")
    if not isinstance(primary_email, str) or not EMAIL_RE.match(primary_email or ""):
        errors.append("gmail.primary_email no es un email válido.")
    if not isinstance(timezone, str) or not timezone:
        errors.append("gmail.timezone debe ser un string no vacío.")

    if not isinstance(max_results, int) or not (1 <= max_results <= 100):
        errors.append("gmail.max_results debe ser int en rango 1..100.")
    if not isinstance(backoff_max_tries, int) or backoff_max_tries < 1:
        errors.append("gmail.backoff_max_tries debe ser >= 1.")
    if not isinstance(backoff_base_ms, int) or backoff_base_ms < 0:
        errors.append("gmail.backoff_base_ms debe ser >= 0.")
    if not isinstance(backoff_jitter_ms, int) or backoff_jitter_ms < 0:
        errors.append("gmail.backoff_jitter_ms debe ser >= 0.")

    if not isinstance(fields_list, str) or not fields_list.strip():
        errors.append("gmail.fields_list debe ser string no vacío.")
    if not isinstance(fields_get, str) or not fields_get.strip():
        errors.append("gmail.fields_get debe ser string no vacío.")
    if not isinstance(headers_get, list):
        errors.append("gmail.headers_get debe ser lista (puede estar vacía).")

    if isinstance(max_results, int) and max_results > 50:
        warnings.append("gmail.max_results > 50 puede impactar latencia.")
    if isinstance(backoff_base_ms, int) and backoff_base_ms < 100:
        warnings.append("gmail.backoff_base_ms < 100 ms puede ser agresivo en real.")
    if timezone and timezone != "America/Santiago":
        warnings.append("gmail.timezone distinto a America/Santiago (solo aviso).")

    return (len(errors) == 0), errors, warnings

# ----------------------------- Helpers backend ------------------------------
def _detect_backend() -> str:
    val = os.getenv("USE_FAKE_GMAIL", "").strip().lower()
    return "fake" if val in {"1", "true", "yes", "y"} else "real"

def _credentials_path() -> Path:
    p = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "./credentials.json")
    return Path(p).resolve()

def _token_path() -> Path:
    return (Path(os.getcwd()) / "token.json").resolve()

def _file_state(p: Path) -> str:
    return "present" if p.exists() else "missing"

# -------------------------------- Blueprint ---------------------------------
bp = Blueprint("health_api", __name__)

@bp.get("/health")
def health():
    t0 = time.perf_counter()

    backend = _detect_backend()
    checks: Dict[str, Any] = {
        "config_loaded": False,
        "credentials_file": None,
        "token_file": None,
        "scopes_minimal": None,
    }
    warnings: List[str] = []
    errors: List[str] = []

    cfg: Dict[str, Any] = {}
    try:
        cfg = _load_config() or {}
        checks["config_loaded"] = True
    except Exception as ex:
        errors.append(f"config: {type(ex).__name__}: {str(ex)}")

    if checks["config_loaded"]:
        ok_cfg, errs, warns = _validate_with_utils(cfg or {})
        if not ok_cfg:
            errors.extend(errs)
        warnings.extend(warns)
        try:
            scopes = (cfg.get("gmail", {}) or {}).get("scopes", [])
            checks["scopes_minimal"] = isinstance(scopes, list) and len(scopes) > 0
        except Exception:
            checks["scopes_minimal"] = False

    cred = _credentials_path()
    tok = _token_path()
    checks["credentials_file"] = _file_state(cred)
    checks["token_file"] = _file_state(tok)

    ok = len(errors) == 0
    status = 200 if ok else 503

    payload = {
        "ok": ok,
        "version": VERSION,
        "backend": backend,
        "checks": checks,
        "warnings": warnings,
        "errors": errors[:3],
        "duration_ms": round((time.perf_counter() - t0) * 1000, 2),
    }
    return jsonify(payload), status

def register_health(app) -> None:
    app.register_blueprint(bp)
