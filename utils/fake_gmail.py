# utils/fake_gmail.py
from __future__ import annotations

import json
import time
import random
from dataclasses import dataclass
from datetime import datetime, timezone
from zoneinfo import ZoneInfo
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple

from utils.config import get_fake_emails_path, CONFIG

TZ_SCL = ZoneInfo("America/Santiago")


# ------------------- Simulación (latencia/errores) -------------------

class SimulatedGmailError(RuntimeError):
    """Error para emular 429/503 en backend fake."""
    def __init__(self, code: int):
        self.code = int(code)
        super().__init__(f"Simulated Gmail error {self.code}")


def _sim_settings() -> Dict[str, Any]:
    gmail = CONFIG.get("gmail", {}) if isinstance(CONFIG, dict) else {}
    sim = gmail.get("simulate", {}) if isinstance(gmail, dict) else {}
    return {
        "enabled": bool(sim.get("enabled", False)),
        "latency_ms": int(sim.get("latency_ms", 0)),
        "jitter_ms": int(sim.get("jitter_ms", 0)),
        "error_rate_get": float(sim.get("error_rate_get", 0.0)),
        "error_code": int(sim.get("error_code", 429)),
    }


def _sleep_ms(ms: int) -> None:
    if ms > 0:
        time.sleep(ms / 1000.0)


def _maybe_simulate(kind: str = "get") -> None:
    """
    Emula comportamiento de Gmail real:
      - Demora por request (latency_ms ± jitter)
      - Fallo aleatorio con prob. error_rate_get (códigos 429/503)
    Se activa solo si gmail.simulate.enabled = true.
    """
    s = _sim_settings()
    if not s["enabled"]:
        return

    base = max(0, s["latency_ms"])
    jit = max(0, s["jitter_ms"])
    if jit:
        delta = random.randint(-jit, jit)
    else:
        delta = 0
    _sleep_ms(max(0, base + delta))

    # Emulamos error solo en operaciones tipo "get" (por item).
    if kind == "get":
        if random.random() < max(0.0, min(1.0, s["error_rate_get"])):
            raise SimulatedGmailError(s["error_code"])


# --------------------- Modelo y conversión ---------------------

@dataclass(frozen=True)
class FakeEmail:
    id: str
    from_: str
    subject: str
    date_epoch_ms: int
    snippet: str
    labels: List[str]
    has_attachments: bool
    body: str
    to: List[str]
    cc: List[str]
    is_unread: bool

    @property
    def date_dt(self) -> datetime:
        return datetime.fromtimestamp(self.date_epoch_ms / 1000.0, tz=timezone.utc)

    def to_gmail_like(self) -> Dict[str, Any]:
        # Emula costo de messages.get (por item)
        _maybe_simulate(kind="get")

        return {
            "id": self.id,
            "snippet": self.snippet,
            "internalDate": str(self.date_epoch_ms),
            "labelIds": self.labels,
            "hasAttachments": self.has_attachments,
            "payload": {
                "headers": [
                    {"name": "From", "value": self.from_},
                    {"name": "Subject", "value": self.subject},
                    {
                        "name": "Date",
                        "value": self.date_dt.astimezone().strftime("%a, %d %b %Y %H:%M:%S %z"),
                    },
                    {"name": "To", "value": ", ".join(self.to)},
                    {"name": "Cc", "value": ", ".join(self.cc)},
                ],
                "body": {"data": self.body},
            },
            # Campos de acceso rápido:
            "from": self.from_,
            "subject": self.subject,
            "to": self.to,
            "cc": self.cc,
            "isUnread": self.is_unread,
            "body": self.body,
        }


# --------------------- Carga + cache en memoria ---------------------

_CACHE: List[FakeEmail] | None = None

def _load_fixture() -> List[FakeEmail]:
    global _CACHE
    if _CACHE is not None:
        return _CACHE

    path: Path = get_fake_emails_path()
    with path.open("r", encoding="utf-8") as f:
        raw = json.load(f)

    emails: List[FakeEmail] = []
    for e in raw:
        emails.append(
            FakeEmail(
                id=str(e.get("id")),
                from_=e.get("from", ""),
                subject=e.get("subject", ""),
                date_epoch_ms=int(e.get("internalDate", e.get("dateEpochMs", 0))),
                snippet=e.get("snippet", ""),
                labels=list(e.get("labels", [])),
                has_attachments=bool(e.get("hasAttachments", False)),
                body=e.get("body", ""),
                to=list(e.get("to", [])),
                cc=list(e.get("cc", [])),
                is_unread=bool(e.get("isUnread", True)),
            )
        )

    # Orden descendente por fecha (más nuevo primero)
    emails.sort(key=lambda x: x.date_epoch_ms, reverse=True)
    _CACHE = emails
    return _CACHE


# --------------------- API simulada (compatible con core) ---------------------

def listar(max_results: int = 20) -> List[Dict[str, Any]]:
    """
    Devuelve correos en formato gmail-like.
    Simula costo por item (como si fuese messages.get por id).
    """
    data = _load_fixture()
    out: List[Dict[str, Any]] = []
    for e in data[:max_results]:
        out.append(e.to_gmail_like())
    return out


def leer_ultimo() -> Optional[Dict[str, Any]]:
    """
    Devuelve el último correo (más reciente) en formato 'gmail-like'.
    """
    data = _load_fixture()
    if not data:
        return None
    return data[0].to_gmail_like()


def remitentes_hoy(now: Optional[datetime] = None) -> List[str]:
    """
    Lista remitentes únicos que escribieron HOY (zona local del host).
    Nota: simulación se aplica por item (como messages.get).
    """
    now = now or datetime.now(TZ_SCL)
    data = _load_fixture()
    senders: List[str] = []
    for e in data:
        # Aplica simulación por item
        _maybe_simulate(kind="get")

        dt_local = datetime.fromtimestamp(
            e.date_epoch_ms / 1000.0, tz=timezone.utc
        ).astimezone(TZ_SCL)
        if dt_local.date() == now.date():
            if e.from_ not in senders:
                senders.append(e.from_)
        else:
            # orden desc → al pasar a ayer, cortamos
            if dt_local.date() < now.date():
                break
    return senders


def contar_no_leidos() -> int:
    """
    Cuenta correos marcados como no leídos en el fixture.
    Simula costo por item.
    """
    cnt = 0
    for e in _load_fixture():
        _maybe_simulate(kind="get")
        if e.is_unread:
            cnt += 1
    return cnt


def buscar(query: str, max_results: int = 20) -> List[Dict[str, Any]]:
    """
    Búsqueda naive contains() en from/subject/body. Mantiene orden por fecha.
    Simula costo por item.
    """
    q = (query or "").strip().lower()
    if not q:
        return []
    out: List[Dict[str, Any]] = []
    for e in _load_fixture():
        _maybe_simulate(kind="get")
        hay = (
            q in e.from_.lower()
            or q in e.subject.lower()
            or q in e.body.lower()
        )
        if hay:
            out.append(e.to_gmail_like())
        if len(out) >= max_results:
            break
    return out
