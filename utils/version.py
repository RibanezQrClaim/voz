# utils/version.py
from pathlib import Path

def _read_version() -> str:
    ver_file = Path(__file__).resolve().parent.parent / "VERSION"
    try:
        return ver_file.read_text(encoding="utf-8").strip() or "dev"
    except Exception:
        return "dev"

VERSION = _read_version()
