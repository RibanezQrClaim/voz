#!/usr/bin/env python
"""Benchmark local de operaciones Gmail."""
from __future__ import annotations
import os
import time
import math
import statistics
import platform
from datetime import datetime
from zoneinfo import ZoneInfo

import pathlib
import sys

sys.path.append(str(pathlib.Path(__file__).resolve().parents[1]))

from core.gmail import listar, leer_ultimo, remitentes_hoy, contar_no_leidos, buscar

REPS = int(os.getenv("SMOKE_REPS", "20"))

OPS = {
    "listar": lambda: listar(max_results=10),
    "leer_ultimo": leer_ultimo,
    "remitentes_hoy": remitentes_hoy,
    "contar_no_leidos": contar_no_leidos,
    "buscar": lambda: buscar("reunión"),
}


def percentile(data, pct: float) -> float:
    data = sorted(data)
    k = math.ceil(len(data) * pct / 100) - 1
    k = max(0, min(k, len(data) - 1))
    return data[k]


def main() -> None:
    results = []
    for name, fn in OPS.items():
        times = []
        for _ in range(REPS):
            start = time.perf_counter()
            fn()
            times.append((time.perf_counter() - start) * 1000)
        p50 = statistics.median(times)
        p95 = percentile(times, 95)
        results.append((name, p50, p95))
    backend = "fake" if os.getenv("USE_FAKE_GMAIL", "").lower() in ("1", "true", "yes") else "real"
    ts = datetime.now(ZoneInfo("America/Santiago")).isoformat()
    py = platform.python_version()
    print(f"timestamp={ts} backend={backend} python={py}")
    print("op\tp50_ms\tp95_ms")
    for name, p50, p95 in results:
        print(f"{name}\t{p50:.2f}\t{p95:.2f}")


if __name__ == "__main__":
    main()
