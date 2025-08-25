# utils/circuit_breaker.py
from __future__ import annotations
import time
import threading
from typing import Dict, Any, Tuple

# Estado por clave (op): closed | open | half
# Estructura: key -> {state, fail_count, opened_at, cooldown_s, threshold}
_STATE: Dict[str, Dict[str, Any]] = {}
_LOCK = threading.RLock()

DEFAULT_THRESHOLD = 3
DEFAULT_COOLDOWN_S = 30
DEFAULT_CODES = {429, 500, 502, 503, 504}

def _now() -> float:
    return time.time()

def _get(key: str) -> Dict[str, Any]:
    with _LOCK:
        st = _STATE.get(key)
        if not st:
            st = {"state": "closed", "fail_count": 0, "opened_at": 0.0,
                  "cooldown_s": DEFAULT_COOLDOWN_S, "threshold": DEFAULT_THRESHOLD}
            _STATE[key] = st
        return st

def configure(key: str, *, threshold: int, cooldown_s: int) -> None:
    with _LOCK:
        st = _get(key)
        st["threshold"] = max(1, int(threshold))
        st["cooldown_s"] = max(1, int(cooldown_s))

def reset(key: str) -> None:
    with _LOCK:
        st = _get(key)
        st["state"] = "closed"
        st["fail_count"] = 0
        st["opened_at"] = 0.0

def before_call(key: str) -> Tuple[bool, float]:
    """
    Devuelve (allow, retry_after_s).
    - closed  -> (True, 0)
    - open    -> (False, remaining)
    - half    -> (True, 0)  (probamos una)
    """
    with _LOCK:
        st = _get(key)
        if st["state"] == "closed":
            return True, 0.0
        if st["state"] == "open":
            elapsed = _now() - st["opened_at"]
            if elapsed >= st["cooldown_s"]:
                st["state"] = "half"
                return True, 0.0
            return False, max(0.0, st["cooldown_s"] - elapsed)
        # half-open
        return True, 0.0

def after_success(key: str) -> None:
    # Cierra y resetea contadores
    reset(key)

def after_failure(key: str, code: int, *, watched_codes = DEFAULT_CODES) -> None:
    with _LOCK:
        st = _get(key)
        if code not in watched_codes:
            # No cuenta para el breaker; mantenemos estado
            return
        if st["state"] == "half":
            # Prueba falló → abrir de nuevo
            st["state"] = "open"
            st["opened_at"] = _now()
            st["fail_count"] = max(st["threshold"], 1)
            return
        # closed u open (durante ventana ya debería estar bloqueando)
        st["fail_count"] = int(st["fail_count"]) + 1
        if st["fail_count"] >= int(st["threshold"]):
            st["state"] = "open"
            st["opened_at"] = _now()

def status(key: str) -> Dict[str, Any]:
    with _LOCK:
        st = dict(_get(key))
    # Enriquecer con retry_after
    allow, retry_after = before_call(key)
    st["allow"] = allow
    st["retry_after_s"] = retry_after
    return st
