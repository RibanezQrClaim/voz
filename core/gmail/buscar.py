# core/gmail/buscar.py
from __future__ import annotations
from typing import List, Dict, Any, Optional

from .auth import get_authenticated_service
from .leer import _list_primary_message_ids, _get_message_metadata
from utils import config
from utils.retry import RetryError


def buscar(query: str, max_results: Optional[int] = None) -> List[Dict[str, Any]]:
    """
    Búsqueda simple en Gmail (Primary) respetando robustez H4:
      - Paginación segura con nextPageToken (reutiliza helpers de leer.py)
      - Campos mínimos y headers filtrados (reutiliza helpers de leer.py)
      - Backoff con jitter ante 429/403 rate/5xx (reutiliza retry interno)
      - Corte estricto en max_results (configurable)
    """
    q = (query or "").strip()
    if not q:
        return []

    settings = config.get_gmail_settings()
    if max_results is not None:
        # Respeta límite global y el solicitado
        settings["max_results"] = max(1, min(int(max_results), settings["max_results"]))

    service = get_authenticated_service()

    # Reutiliza la misma lógica de listado que Primary (agrega el query del usuario)
    ids = _list_primary_message_ids(service, settings, base_query=q)

    out: List[Dict[str, Any]] = []
    for mid in ids:
        try:
            meta = _get_message_metadata(service, mid, settings)
            if meta:
                out.append(meta)
        except RetryError:
            # Si se agotaron reintentos en este ID, seguimos con el siguiente
            continue
        if len(out) >= settings["max_results"]:
            break

    return out
