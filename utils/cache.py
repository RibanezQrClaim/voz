# utils/cache.py
from __future__ import annotations
import time
import threading
from typing import Any, Dict, Tuple, Hashable

# Estructura interna: key -> (expires_at_epoch_sec, value)
_STORE: Dict[Hashable, Tuple[float, Any]] = {}
_LOCK = threading.RLock()

def _now() -> float:
    return time.time()

def make_cache_key(prefix: str, **parts: Any) -> Hashable:
    """
    Llave determinística y hasheable.
    Ej: make_cache_key("msg_get", id="abc", fields="id,snippet")
    """
    items = tuple(sorted(parts.items()))
    return (prefix, items)

def cache_get(key: Hashable) -> Any | None:
    with _LOCK:
        entry = _STORE.get(key)
        if not entry:
            return None
        exp, val = entry
        if exp < _now():
            # expirado → limpiar y miss
            try:
                del _STORE[key]
            except Exception:
                pass
            return None
        return val

def cache_set(key: Hashable, value: Any, ttl_seconds: int) -> None:
    if ttl_seconds <= 0:
        return
    with _LOCK:
        _STORE[key] = (_now() + ttl_seconds, value)

def cache_clear(prefix: str | None = None) -> int:
    """
    Limpia toda la cache o solo las llaves que matcheen el prefix.
    Retorna cuántas entradas se eliminaron.
    """
    removed = 0
    with _LOCK:
        if prefix is None:
            removed = len(_STORE)
            _STORE.clear()
            return removed

        to_del = []
        for k in _STORE.keys():
            if isinstance(k, tuple) and len(k) >= 1 and k[0] == prefix:
                to_del.append(k)
        for k in to_del:
            try:
                del _STORE[k]
                removed += 1
            except Exception:
                pass
    return removed
