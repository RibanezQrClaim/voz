# core/gmail/__init__.py
"""Abstracción de Gmail con soporte para modo fake/real y timing opcional."""
from __future__ import annotations

import os
import time
from typing import Any, Dict, List

# Flags de backend y logging simple
USE_FAKE = os.getenv("USE_FAKE_GMAIL", "false").lower() in {"1", "true", "yes"}
BACKEND = "fake" if USE_FAKE else "real"
LOG_TIMING = os.getenv("GMAIL_TIMING", "0").lower() in {"1", "true", "yes"}


def _timed(name: str, fn):
    start = time.perf_counter()
    result = fn()
    if LOG_TIMING:
        duration_ms = (time.perf_counter() - start) * 1000.0
        print(f"{name} backend={BACKEND} duration_ms={duration_ms:.2f}")
    return result


# Selección de funciones base por backend
if USE_FAKE:
    # utils.fake_gmail debe existir en tu proyecto
    from utils.fake_gmail import (  # type: ignore
        listar as _listar,
        leer_ultimo as _leer_ultimo,
        contar_no_leidos as _contar_no_leidos,
    )
    # buscar puede no existir en fake → hacemos fallback a lista vacía
    try:
        from utils.fake_gmail import buscar as _buscar  # type: ignore
    except Exception:
        def _buscar(*, query: str, max_results: int = 20, **kwargs) -> List[Dict[str, Any]]:
            return []
else:
    from .leer import (  # type: ignore
        listar as _listar,
        leer_ultimo as _leer_ultimo,
        contar_no_leidos as _contar_no_leidos,
    )
    # Buscar real es opcional: si no está, devolvemos vacío
    try:
        from .buscar import buscar as _buscar  # type: ignore
    except Exception:
        def _buscar(*, query: str, max_results: int = 20, **kwargs) -> List[Dict[str, Any]]:
            return []

# Remitentes: módulo dedicado (fake/real lo resuelve internamente)
from .remitentes import (  # type: ignore
    remitentes_hoy as _remitentes_hoy,
    remitentes_ayer as _remitentes_ayer,
)


def listar(
    max_results: int | None = None,
    base_query: str | None = None,
    *args,
    **kwargs,
) -> List[Dict[str, Any]]:
    if args or kwargs:
        print(f"⚠️ listar ignoró args extra: args={args} kwargs={kwargs}")

    call_kwargs: Dict[str, Any] = {}
    if max_results is not None:
        call_kwargs["max_results"] = max_results
    if base_query is not None:
        call_kwargs["base_query"] = base_query

    return _timed("listar", lambda: _listar(**call_kwargs))


def remitentes_hoy(*args, **kwargs) -> List[str]:
    if args or kwargs:
        print(f"⚠️ remitentes_hoy ignoró args extra: args={args} kwargs={kwargs}")
    return _timed("remitentes_hoy", _remitentes_hoy)


def remitentes_ayer(*args, **kwargs) -> List[str]:
    if args or kwargs:
        print(f"⚠️ remitentes_ayer ignoró args extra: args={args} kwargs={kwargs}")
    return _timed("remitentes_ayer", _remitentes_ayer)


def leer_ultimo(*args, **kwargs) -> Dict[str, Any]:
    if args or kwargs:
        print(f"⚠️ leer_ultimo ignoró args extra: args={args} kwargs={kwargs}")
    return _timed("leer_ultimo", _leer_ultimo)


def contar_no_leidos(*args, **kwargs) -> int:
    if args or kwargs:
        print(f"⚠️ contar_no_leidos ignoró args extra: args={args} kwargs={kwargs}")
    return _timed("contar_no_leidos", _contar_no_leidos)


def buscar(query: str, max_results: int = 20, *args, **kwargs) -> List[Dict[str, Any]]:
    if args or kwargs:
        print(f"⚠️ buscar ignoró args extra: args={args} kwargs={kwargs}")
    return _timed("buscar", lambda: _buscar(query=query, max_results=max_results))


__all__ = [
    "listar",
    "remitentes_hoy",
    "remitentes_ayer",
    "leer_ultimo",
    "contar_no_leidos",
    "buscar",
]
