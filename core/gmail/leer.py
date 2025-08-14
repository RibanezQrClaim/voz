# core/gmail/leer.py
from typing import List, Dict, Any, Optional
import os
from .auth import get_authenticated_service
from utils.dates import get_rfc3339_today

# Etiquetas/categorías a excluir
EXCLUDED_LABELS = {
    "CATEGORY_SOCIAL",
    "CATEGORY_PROMOTIONS",
    "CATEGORY_UPDATES",
    "CATEGORY_FORUMS",
    "SPAM",
    "TRASH",
}

# Máximo de correos a considerar (puede venir por .env)
GMAIL_MAX_RESULTS = int(os.getenv("GMAIL_MAX_RESULTS", "10"))

# Campos mínimos para bajar latencia (partial response)
MESSAGE_FIELDS_LIST = "messages(id),nextPageToken"
MESSAGE_FIELDS_GET = "id,internalDate,labelIds,snippet,payload(headers(name,value))"

# Solo headers que usamos
METADATA_HEADERS = ["From", "Subject", "Date"]


def _primary_query(base_query: Optional[str] = None) -> str:
    """
    Construye un query que prioriza bandeja principal y excluye categorías ruidosas.
    """
    parts = [
        "category:primary",
        "-category:social",
        "-category:promotions",
        "-category:updates",
        "-category:forums",
        "-in:spam",
        "-in:trash",
    ]
    if base_query:
        parts.append(f"({base_query})")
    return " ".join(parts)


def _list_primary_message_ids(
    service,
    max_results: int = GMAIL_MAX_RESULTS,
    base_query: Optional[str] = None,
) -> List[str]:
    """
    Lista IDs de mensajes de la bandeja principal con exclusiones y campos mínimos.
    """
    q = _primary_query(base_query)
    resp = (
        service.users()
        .messages()
        .list(
            userId="me",
            q=q,
            labelIds=["INBOX"],
            maxResults=max_results,
            includeSpamTrash=False,  # defensivo
            fields=MESSAGE_FIELDS_LIST,  # limita el payload
        )
        .execute()
        or {}
    )
    msgs = resp.get("messages", []) or []
    return [m["id"] for m in msgs]


def _get_message_metadata(service, msg_id: str) -> Dict[str, Any]:
    """
    Trae solo metadata y snippet; filtra por labelIds en cliente por seguridad.
    """
    msg = (
        service.users()
        .messages()
        .get(
            userId="me",
            id=msg_id,
            format="metadata",
            metadataHeaders=METADATA_HEADERS,
            fields=MESSAGE_FIELDS_GET,  # limita el payload
        )
        .execute()
        or {}
    )

    # Filtro defensivo por labels (por si el query igual trajo algo no deseado)
    label_ids = set(msg.get("labelIds", []) or [])
    if label_ids & EXCLUDED_LABELS:
        return {}  # descartar silenciosamente

    return msg

def listar(max_results: int = GMAIL_MAX_RESULTS, base_query: str | None = None) -> List[Dict[str, Any]]:
    """Lista correos de la bandeja principal."""
    service = get_authenticated_service()
    ids = _list_primary_message_ids(service, max_results, base_query=base_query)
    out: List[Dict[str, Any]] = []
    for mid in ids:
        meta = _get_message_metadata(service, mid)
        if meta:
            out.append(meta)
    return out


def remitentes_hoy() -> List[str]:
    """
    Retorna remitentes de últimos N correos en Primary estrictamente de hoy (≈ últimas 24h).
    """
    service = get_authenticated_service()
    after = get_rfc3339_today()
    ids = _list_primary_message_ids(
        service, GMAIL_MAX_RESULTS, base_query=f"after:{after}"
    )
    remitentes: List[str] = []
    for mid in ids:
        meta = _get_message_metadata(service, mid)
        if not meta:
            continue
        headers = {h["name"].lower(): h["value"] for h in meta.get("payload", {}).get("headers", [])}
        frm = headers.get("from") or ""
        if frm:
            remitentes.append(frm)
    return remitentes


def leer_ultimo() -> Dict[str, Any]:
    """
    Retorna metadata del último correo 'bueno' (Primary).
    """
    service = get_authenticated_service()
    ids = _list_primary_message_ids(service, max_results=1)
    if not ids:
        return {}
    meta = _get_message_metadata(service, ids[0])
    return meta or {}


def contar_no_leidos() -> int:
    """
    Cuenta no leídos SOLO en Primary (excluyendo Social/Promos/etc.).
    """
    service = get_authenticated_service()
    resp = (
        service.users()
        .messages()
        .list(
            userId="me",
            q="is:unread",
            labelIds=["INBOX"],
            includeSpamTrash=False,
            fields="resultSizeEstimate",
        )
        .execute()
        or {}
    )
    return int(resp.get("resultSizeEstimate", 0))
