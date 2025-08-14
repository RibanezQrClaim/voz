"""Abstracción de Gmail con soporte para modo falso via flags."""
from __future__ import annotations
import os
import time
from typing import Any, Dict, List

USE_FAKE = os.getenv("USE_FAKE_GMAIL", "false").lower() in ("1", "true", "yes")
BACKEND = "fake" if USE_FAKE else "real"


def _timed(name: str, fn):
    start = time.perf_counter()
    result = fn()
    duration_ms = (time.perf_counter() - start) * 1000
    print(f"{name} backend={BACKEND} duration_ms={duration_ms:.2f}")
    return result


if USE_FAKE:
    from utils.fake_gmail import (
        listar as _listar,
        remitentes_hoy as _remitentes_hoy,
        leer_ultimo as _leer_ultimo,
        contar_no_leidos as _contar_no_leidos,
        buscar as _buscar,
    )
else:
    from .leer import (
        listar as _listar,
        remitentes_hoy as _remitentes_hoy,
        leer_ultimo as _leer_ultimo,
        contar_no_leidos as _contar_no_leidos,
    )
    from .buscar import buscar as _buscar


def listar(max_results: int | None = None, base_query: str | None = None, *args, **kwargs) -> List[Dict[str, Any]]:
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
    "leer_ultimo",
    "contar_no_leidos",
    "buscar",
]
