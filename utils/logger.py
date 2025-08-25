# utils/logger.py
from __future__ import annotations

import os
import time
from datetime import datetime
from typing import Any, Dict, Optional

# Carpeta de logs
LOG_DIR = "logs"
os.makedirs(LOG_DIR, exist_ok=True)

def _now() -> datetime:
    # Hora local (simple y suficiente para el MVP)
    return datetime.now()

def _date_str(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%d")

def _time_str(dt: datetime) -> str:
    return dt.strftime("%H:%M:%S")

def _log_path(usuario_id: str, dt: Optional[datetime] = None) -> str:
    dt = dt or _now()
    fname = f"usuario_{usuario_id}_{_date_str(dt)}.log"
    return os.path.join(LOG_DIR, fname)

def _kv(key: str, value: Any) -> str:
    """
    Formatea pares clave=valor en una sola línea, sin saltos.
    """
    if isinstance(value, str):
        val = value.replace("\n", " ").replace("\r", " ").strip()
    else:
        val = repr(value)
    return f"{key}={val}"

def _write_line(path: str, line: str) -> None:
    with open(path, "a", encoding="utf-8") as f:
        f.write(line + "\n")

def log_usuario(usuario_id: str, mensaje: str) -> None:
    """
    Compatibilidad hacia atrás: formato simple tipo
    [HH:MM:SS] <mensaje>
    """
    dt = _now()
    line = f"[{_time_str(dt)}] {mensaje}"
    _write_line(_log_path(usuario_id, dt), line)

def log_event(
    usuario_id: str,
    *,
    accion: str,
    backend: str,
    duration_ms: Optional[float] = None,
    ok: Optional[bool] = None,
    items: Optional[int] = None,
    extra: Optional[Dict[str, Any]] = None,
) -> None:
    """
    Log estructurado, una sola línea por evento:
    [HH:MM:SS] accion=... backend=fake|real duration_ms=123.45 ok=True items=5 extra={'k': 'v'}
    """
    dt = _now()
    parts = [
        f"[{_time_str(dt)}]",
        _kv("accion", accion),
        _kv("backend", backend),
    ]
    if duration_ms is not None:
        parts.append(_kv("duration_ms", f"{duration_ms:.2f}"))
    if ok is not None:
        parts.append(_kv("ok", ok))
    if items is not None:
        parts.append(_kv("items", items))
    if extra:
        parts.append(_kv("extra", extra))

    line = " ".join(parts)
    _write_line(_log_path(usuario_id, dt), line)

def log_error(
    usuario_id: str,
    *,
    accion: str,
    backend: str,
    error: Exception,
    duration_ms: Optional[float] = None,
    extra: Optional[Dict[str, Any]] = None,
) -> None:
    """
    Log de error con campos base + tipo/mensaje de excepción.
    """
    dt = _now()
    parts = [
        f"[{_time_str(dt)}]",
        _kv("nivel", "ERROR"),
        _kv("accion", accion),
        _kv("backend", backend),
        _kv("exc_type", type(error).__name__),
        _kv("exc_msg", str(error)),
    ]
    if duration_ms is not None:
        parts.append(_kv("duration_ms", f"{duration_ms:.2f}"))
    if extra:
        parts.append(_kv("extra", extra))

    line = " ".join(parts)
    _write_line(_log_path(usuario_id, dt), line)

class Timer:
    """
    Medidor simple de duración en ms:
        t = Timer.start()
        ... trabajo ...
        ms = t.ms()
    """
    def __init__(self) -> None:
        self._t0 = time.perf_counter()

    @classmethod
    def start(cls) -> "Timer":
        return cls()

    def ms(self) -> float:
        return (time.perf_counter() - self._t0) * 1000.0
