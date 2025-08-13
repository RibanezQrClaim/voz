from __future__ import annotations
from typing import List, Dict, Any

from .leer import (
    _list_primary_message_ids,
    _get_message_metadata,
    GMAIL_MAX_RESULTS,
)
from .auth import get_authenticated_service


def buscar(query: str, max_results: int = 20, service=None) -> List[Dict[str, Any]]:
    """Busqueda simple en Gmail API manteniendo orden y forma."""
    service = service or get_authenticated_service()
    q = (query or "").strip()
    if not q:
        return []
    n = max(1, min(int(max_results), GMAIL_MAX_RESULTS))
    ids = _list_primary_message_ids(service, n, base_query=q)
    out: List[Dict[str, Any]] = []
    for mid in ids:
        meta = _get_message_metadata(service, mid)
        if meta:
            out.append(meta)
        if len(out) >= n:
            break
    return out
