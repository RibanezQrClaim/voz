# tools/fix_fake_emails.py
# -*- coding: utf-8 -*-
"""
Ajusta un fixture de correos fake para modo local:
- Actualiza fechas a HOY/AYER en America/Santiago:
  * internalDate (epoch ms)
  * ts (ISO-8601 con offset)
  * header "Date" (RFC 2822)
- Normaliza el cuerpo: payload.body.data en base64-url UTF-8 (si venía texto crudo)
- Opciones: dry-run, backup, cuántos corrcd..eos marcar como hoy/ayer

Uso:
  python tools/fix_fake_emails.py tests/fixtures/emails_home.json --today-k 5 --yesterday-k 3 --backup

Requisitos:
  - Python 3.9+ (recomendado 3.11+)
  - En Windows: `pip install tzdata` para ZoneInfo("America/Santiago")
"""

import argparse
import base64
import json
from pathlib import Path
from typing import Any, Dict, List, Optional
from datetime import datetime, timedelta, timezone
from email.utils import format_datetime

try:
    from zoneinfo import ZoneInfo  # Py3.9+; en Windows instala tzdata
    TZ_SCL = ZoneInfo("America/Santiago")
except Exception:
    # Fallback “aproximado” (invierno -04:00). Ajusta si usas horario de verano.
    TZ_SCL = timezone(timedelta(hours=-4))

def _is_base64url_ascii(s: str) -> bool:
    try:
        s_bytes = s.encode("ascii")
        s_bytes += b"=" * ((4 - len(s_bytes) % 4) % 4)
        base64.urlsafe_b64decode(s_bytes)
        return True
    except Exception:
        return False

def _to_base64url(s: str) -> str:
    return base64.urlsafe_b64encode(s.encode("utf-8")).decode("ascii")

def _ensure_payload_base64(meta: Dict[str, Any]) -> bool:
    """
    Normaliza payload.body.data => base64-url UTF-8.
    Acepta:
      - body.data (texto crudo o base64)
      - body.text (texto crudo)
    Devuelve True si cambió algo.
    """
    payload = meta.get("payload") or {}
    body = payload.get("body") or {}
    changed = False

    # Caso: body.text presente
    if isinstance(body.get("text"), str):
        body["data"] = _to_base64url(body["text"])
        body.pop("text", None)
        payload["body"] = body
        meta["payload"] = payload
        changed = True

    # Caso: data presente pero no base64-url ASCII válido
    data = body.get("data")
    if isinstance(data, str) and not _is_base64url_ascii(data):
        body["data"] = _to_base64url(data)
        payload["body"] = body
        meta["payload"] = payload
        changed = True

    # Si no hay mimeType, asumir text/plain
    if not (payload.get("mimeType")):
        payload["mimeType"] = "text/plain"
        meta["payload"] = payload
        changed = True

    return changed

def _upsert_header(meta: Dict[str, Any], name: str, value: str) -> None:
    payload = meta.setdefault("payload", {})
    headers = payload.setdefault("headers", [])
    lname = name.lower()
    for h in headers:
        if isinstance(h, dict) and h.get("name", "").lower() == lname:
            h["value"] = value
            return
    headers.append({"name": name, "value": value})

def _set_dates(meta: Dict[str, Any], dt_local: datetime) -> None:
    """Ajusta internalDate (ms), ts (ISO) y header Date (RFC822) a dt_local."""
    # internalDate en ms epoch UTC
    ms = int(dt_local.timestamp() * 1000)
    meta["internalDate"] = ms

    # ts ISO con zona local
    meta["ts"] = dt_local.isoformat()

    # Header Date RFC 2822
    _upsert_header(meta, "Date", format_datetime(dt_local))

def _pick_targets(data: List[Dict[str, Any]], today_k: int, yday_k: int) -> Dict[str, List[int]]:
    """
    Elige índices para hoy y ayer. Toma los primeros N del arreglo (asumiendo orden descendente por fecha).
    """
    n = len(data)
    today_idxs = list(range(0, min(today_k, n)))
    yday_start = len(today_idxs)
    yday_idxs = list(range(yday_start, min(yday_start + yday_k, n)))
    return {"today": today_idxs, "yday": yday_idxs}

def main():
    ap = argparse.ArgumentParser(description="Arregla fechas y cuerpos en fixture de correos fake.")
    ap.add_argument("input", type=str, help="Ruta al JSON de correos (lista de mensajes).")
    ap.add_argument("--output", type=str, default="", help="Ruta de salida. Por defecto, se sobrescribe el input (con --backup).")
    ap.add_argument("--today-k", type=int, default=5, help="Cantidad de correos a marcar como HOY (por defecto 5).")
    ap.add_argument("--yesterday-k", type=int, default=3, help="Cantidad de correos a marcar como AYER (por defecto 3).")
    ap.add_argument("--dry-run", action="store_true", help="No escribe archivos, solo muestra cambios.")
    ap.add_argument("--backup", action="store_true", help="Guarda copia .bak del archivo original si se sobrescribe.")
    ap.add_argument("--spread-minutes", type=int, default=10, help="Separación (min) entre mensajes marcados como HOY.")
    args = ap.parse_args()

    in_path = Path(args.input)
    if not in_path.exists():
        raise SystemExit(f"Input no existe: {in_path}")

    out_path = Path(args.output) if args.output else in_path

    data = json.loads(in_path.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise SystemExit("El JSON debe ser una LISTA de mensajes.")

    picks = _pick_targets(data, args.today_k, args.yesterday_k)

    now = datetime.now(TZ_SCL).replace(microsecond=0)
    # Distribuye HOY hacia atrás cada 'spread-minutes'
    dt_today_list = [now - timedelta(minutes=i * args.spread_minutes) for i in range(len(picks["today"]))]
    # AYER a las mismas horas de HOY menos 1 día
    dt_yday_list = [dt.replace(day=(dt - timedelta(days=1)).day) - timedelta(days=1) for dt in dt_today_list]

    changed_dates = 0
    changed_bodies = 0

    # Aplica fechas HOY
    for idx, dt in zip(picks["today"], dt_today_list):
        meta = data[idx]
        _set_dates(meta, dt)
        changed_dates += 1
        if _ensure_payload_base64(meta):
            changed_bodies += 1

    # Aplica fechas AYER
    for idx, dt in zip(picks["yday"], dt_yday_list):
        meta = data[idx]
        _set_dates(meta, dt)
        changed_dates += 1
        if _ensure_payload_base64(meta):
            changed_bodies += 1

    # Normaliza cuerpo del resto (sin cambiar fechas)
    for i, meta in enumerate(data):
        if i in picks["today"] or i in picks["yday"]:
            continue
        if _ensure_payload_base64(meta):
            changed_bodies += 1

    print(f"Total mensajes: {len(data)}")
    print(f"Actualizados (fechas): {changed_dates}  |  Normalizados (cuerpo/base64): {changed_bodies}")
    print(f"Hoy: idx {picks['today']}  |  Ayer: idx {picks['yday']}")

    if args.dry_run:
        print("Dry-run: no se escribieron cambios.")
        return

    if out_path == in_path and args.backup:
        bak = in_path.with_suffix(in_path.suffix + ".bak")
        bak.write_text(in_path.read_text(encoding="utf-8"), encoding="utf-8")
        print(f"Backup creado: {bak}")

    out_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Escrito: {out_path}")

if __name__ == "__main__":
    main()