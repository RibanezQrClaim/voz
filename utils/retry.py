# utils/retry.py
from __future__ import annotations
import os
import time
import random
import contextvars
from typing import Any, Callable, Dict, Optional, Tuple


class RetryError(Exception):
    """Excepción cuando se agotan los intentos de reintento."""
    def __init__(self, message: str, *, last_error_code: Optional[int], retries_by_code: Dict[str, int], attempts: int):
        super().__init__(message)
        self.last_error_code = last_error_code
        self.retries_by_code = retries_by_code
        self.attempts = attempts


# ---- Acumulador de métricas por-request (contexto local) ----
_retry_ctx: contextvars.ContextVar[Optional[Dict[str, Any]]] = contextvars.ContextVar("_retry_ctx", default=None)

def _ctx_get() -> Dict[str, Any]:
    data = _retry_ctx.get()
    if data is None:
        data = {"calls": 0, "retries_by_code": {}, "slept_ms_total": 0, "backend": None}
        _retry_ctx.set(data)
    return data

def consume_gmail_retry_stats() -> Dict[str, Any]:
    """
    Devuelve un snapshot de métricas acumuladas desde el último consumo y resetea el acumulador.
    Formato:
      {
        "calls": int,
        "retries_by_code": {"429":2,...},
        "slept_ms_total": 500,
        "backend": "fake"|"real"|None
      }
    """
    data = _ctx_get()
    snapshot = {
        "calls": int(data.get("calls", 0)),
        "retries_by_code": dict(data.get("retries_by_code", {})),
        "slept_ms_total": int(data.get("slept_ms_total", 0)),
        "backend": data.get("backend"),
    }
    # reset
    _retry_ctx.set({"calls": 0, "retries_by_code": {}, "slept_ms_total": 0, "backend": None})
    return snapshot


def _extract_status_and_reason(exc: Exception) -> Tuple[Optional[int], str]:
    """
    Intenta extraer status code y una razón útil del error (compatible con googleapiclient y genérico).
    """
    status = None
    reason = ""

    # googleapiclient.errors.HttpError → exc.resp.status, exc.error_details/str(content)
    resp = getattr(exc, "resp", None)
    if resp is not None:
        status = getattr(resp, "status", None)
        if hasattr(resp, "reason") and resp.reason:
            reason = str(resp.reason)

    # requests/HTTP genéricos
    if status is None:
        status = getattr(exc, "status", None) or getattr(exc, "status_code", None)

    # Mensaje textual
    if not reason:
        reason = str(getattr(exc, "reason", "")) or str(exc)

    # Normaliza
    try:
        status = int(status) if status is not None else None
    except Exception:
        status = None

    return status, (reason or "")


def _is_retryable_error(status_code: Optional[int], reason_text: str) -> bool:
    """
    Política de reintento para Gmail:
      - 429 siempre retryable
      - 5xx siempre retryable
      - 403 solo si es rate/quota (rateLimitExceeded / userRateLimitExceeded)
    """
    if status_code == 429:
        return True
    if status_code is not None and 500 <= status_code <= 599:
        return True
    if status_code == 403:
        txt = reason_text.lower()
        if ("ratelimitexceeded" in txt) or ("userratelimitexceeded" in txt) or ("rate limit" in txt) or ("quota" in txt):
            return True
    return False


def run_with_retry_gmail(
    call: Callable[[], Any],
    *,
    max_tries: int,
    base_ms: int,
    jitter_ms: int,
    is_retryable: Callable[[Optional[int], str], bool] = _is_retryable_error,
    sleep_fn: Callable[[float], None] = time.sleep,
) -> Tuple[Any, Dict[str, Any]]:
    """
    Ejecuta `call()` con backoff exponencial + jitter controlado.
    Retorna (resultado, meta) donde meta incluye:
      - attempts: int
      - retries_by_code: Dict[str,int]
      - last_error: Optional[int]
      - slept_ms_total: int
      - backend: "fake"|"real"
    Lanza RetryError si se agotan los intentos.

    NOTA: en modo fake (USE_FAKE_GMAIL=1) hace passthrough sin sleeps.
    """
    # Passthrough en modo FAKE
    if os.getenv("USE_FAKE_GMAIL", "0") == "1":
        result = call()
        meta = {
            "attempts": 1,
            "retries_by_code": {},
            "last_error": None,
            "slept_ms_total": 0,
            "backend": "fake",
        }
        # acumula en contexto
        ctx = _ctx_get()
        ctx["calls"] = int(ctx.get("calls", 0)) + 1
        ctx["backend"] = "fake"
        return result, meta

    retries_by_code: Dict[str, int] = {}
    slept_ms_total = 0
    last_error_code: Optional[int] = None

    tries = max(1, int(max_tries))
    base = max(1, int(base_ms))
    jitter = max(0, int(jitter_ms))

    attempt = 1
    while True:
        try:
            result = call()
            meta = {
                "attempts": attempt,
                "retries_by_code": retries_by_code,
                "last_error": last_error_code,
                "slept_ms_total": slept_ms_total,
                "backend": "real",
            }
            # acumula en contexto
            ctx = _ctx_get()
            ctx["calls"] = int(ctx.get("calls", 0)) + 1
            ctx["backend"] = "real"
            agg = ctx.setdefault("retries_by_code", {})
            for k, v in retries_by_code.items():
                agg[k] = agg.get(k, 0) + int(v)
            ctx["slept_ms_total"] = int(ctx.get("slept_ms_total", 0)) + int(slept_ms_total)
            return result, meta
        except Exception as exc:
            status, reason = _extract_status_and_reason(exc)
            last_error_code = status

            # ¿Se puede reintentar?
            if attempt >= tries or not is_retryable(status, reason):
                raise RetryError(
                    f"Fallo tras {attempt} intento(s). Último error HTTP={status}.",
                    last_error_code=status,
                    retries_by_code=retries_by_code,
                    attempts=attempt,
                ) from exc

            # Incrementa contador por código
            key = str(status) if status is not None else "unknown"
            retries_by_code[key] = retries_by_code.get(key, 0) + 1

            # Calcula backoff exponencial con jitter
            # intento 1 (fallido) → sleep base
            # intento 2 → base*2, etc.
            delay_ms = base * (2 ** (attempt - 1))
            if jitter > 0:
                delay_ms += random.randint(-jitter, jitter)
            delay_s = max(0.0, delay_ms / 1000.0)

            # Duerme y reintenta
            try:
                sleep_fn(delay_s)
            finally:
                slept_ms_total += max(0, int(delay_s * 1000))

            attempt += 1


# Atajo: envoltorio práctico usando un dict de settings (p.ej. utils.config.get_gmail_settings())
def gmail_retry_wrapper(call: Callable[[], Any], settings: Dict[str, Any]) -> Tuple[Any, Dict[str, Any]]:
    """
    Envuelve `call` con retry usando un dict de settings:
      {
        "backoff_max_tries": int,
        "backoff_base_ms": int,
        "backoff_jitter_ms": int
      }
    """
    return run_with_retry_gmail(
        call,
        max_tries=int(settings.get("backoff_max_tries", 3)),
        base_ms=int(settings.get("backoff_base_ms", 200)),
        jitter_ms=int(settings.get("backoff_jitter_ms", 100)),
    )
