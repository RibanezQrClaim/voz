"""Abstracción de Gmail con soporte para modo falso via flags."""
from __future__ import annotations
import os
import time
import functools
from typing import List, Dict, Any

USE_FAKE = os.getenv("USE_FAKE_GMAIL", "false").lower() in ("1", "true", "yes")
BACKEND = "fake" if USE_FAKE else "real"


def _wrap(name, fn):
    @functools.wraps(fn)
    def wrapped(*args, **kwargs):
        start = time.perf_counter()
        result = fn(*args, **kwargs)
        duration_ms = (time.perf_counter() - start) * 1000
        print(f"{name} backend={BACKEND} duration_ms={duration_ms:.2f}")
        return result

    return wrapped


if USE_FAKE:
    from utils.fake_gmail import (
        listar as _listar,
        remitentes_hoy as _remitentes_hoy,
        leer_ultimo as _leer_ultimo,
        contar_no_leidos as _contar_no_leidos,
        buscar as _buscar,
    )

    listar = _wrap("listar", _listar)
    remitentes_hoy = _wrap("remitentes_hoy", _remitentes_hoy)
    leer_ultimo = _wrap("leer_ultimo", _leer_ultimo)
    contar_no_leidos = _wrap("contar_no_leidos", _contar_no_leidos)
    buscar = _wrap("buscar", _buscar)
else:
    from .leer import (
        listar as _listar,
        remitentes_hoy as _remitentes_hoy,
        leer_ultimo as _leer_ultimo,
        contar_no_leidos as _contar_no_leidos,
    )
    from .buscar import buscar as _buscar

    listar = _wrap("listar", _listar)
    remitentes_hoy = _wrap("remitentes_hoy", _remitentes_hoy)
    leer_ultimo = _wrap("leer_ultimo", _leer_ultimo)
    contar_no_leidos = _wrap("contar_no_leidos", _contar_no_leidos)
    buscar = _wrap("buscar", _buscar)

__all__ = [
    "listar",
    "remitentes_hoy",
    "leer_ultimo",
    "contar_no_leidos",
    "buscar",
]
