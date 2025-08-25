# core/action_router.py
from __future__ import annotations
from typing import Any, Dict, List, Optional

# Usa la abstracción que respeta fake/real (core/gmail/__init__.py)
from core.gmail import (
    listar as gmail_listar,
    leer_ultimo as gmail_leer_ultimo,
    contar_no_leidos as gmail_contar_no_leidos,
    remitentes_hoy as gmail_remitentes_hoy,
    buscar as gmail_buscar,
)

# Summarizer (opcional)
try:
    from utils.summarizer import resumir_items as _resumir_items  # type: ignore
except Exception:
    _resumir_items = None  # type: ignore[assignment]

# Importantes (opcional)
try:
    from utils.importance import rank_important_emails as _rank_important  # type: ignore
except Exception:
    _rank_important = None  # type: ignore[assignment]


def _format_item_280(meta: Dict[str, Any]) -> str:
    headers = meta.get("payload", {}).get("headers", []) or []
    h = {x["name"].lower(): x["value"] for x in headers if isinstance(x, dict) and "name" in x and "value" in x}
    frm = h.get("from", "").strip()
    subj = h.get("subject", "").strip()
    snip = (meta.get("snippet") or "").strip()
    txt = f"{frm} — {subj}: {snip}".strip()
    return (txt[:277] + "...") if len(txt) > 280 else txt

def _fallback_resumen(max_items: int = 10) -> List[str]:
    metas = gmail_listar(max_items)
    return [_format_item_280(m) for m in metas]

def _do_resumen(max_items: Optional[int] = None) -> List[str | Dict[str, Any]]:
    metas = gmail_listar(max_items)
    if _resumir_items:
        try:
            return _resumir_items(metas)  # type: ignore[misc]
        except Exception:
            pass
    return [_format_item_280(m) for m in metas]

def _do_importantes(max_items: Optional[int] = None) -> List[Dict[str, Any] | str]:
    metas = gmail_listar(max_items)
    if _rank_important:
        try:
            return _rank_important(metas)  # type: ignore[misc]
        except Exception:
            pass
    return [_format_item_280(m) for m in metas]


def ejecutar_accion(
    intencion: Dict[str, Any],
    comando: Optional[str] = None,
    *args: Any,
    **kwargs: Any,
) -> Any:
    accion = (intencion.get("accion") or "").strip().lower()
    filtros = kwargs.get("filtros") or intencion.get("filtros") or {}

    if accion == "remitentes_hoy":
        return gmail_remitentes_hoy()

    if accion == "leer_ultimo":
        return gmail_leer_ultimo()

    if accion == "contar_no_leidos":
        return gmail_contar_no_leidos()

    if accion in {"resumen", "resumen_hoy"}:
        return _do_resumen(filtros.get("max"))

    if accion == "resumen_ayer":
        # Fallback simple. Si luego tienes lógica “ayer”, cámbiala aquí.
        return _do_resumen(filtros.get("max"))

    if accion in {"buscar", "buscar_correo"}:
        query = (filtros.get("query") if isinstance(filtros, dict) else None) or (comando or "")
        query = (query or "").strip()
        if not query:
            return []
        return gmail_buscar(query, filtros.get("max") or None)

    if accion in {"correos_importantes", "importantes"}:
        return _do_importantes(filtros.get("max"))

    # Fallback: resumen básico
    return _fallback_resumen(filtros.get("max") or 10)
