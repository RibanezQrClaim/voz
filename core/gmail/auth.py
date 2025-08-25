# core/gmail/auth.py
from __future__ import annotations

import os
from pathlib import Path
from typing import Optional, List

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

# Config centralizada (H4)
from utils import config as cfg

# Cache en módulo para no reconstruir el cliente en cada llamada
_SERVICE = None  # type: Optional[object]


def _scopes() -> List[str]:
    """Scopes desde config.json; fallback a ENV si fuera necesario."""
    try:
        scopes = cfg.gmail_scopes()
        return scopes if scopes else (os.getenv("GMAIL_SCOPES", "gmail.readonly gmail.modify").split())
    except Exception:
        return os.getenv("GMAIL_SCOPES", "gmail.readonly gmail.modify").split()


def _credentials_paths() -> tuple[Path, Path]:
    """
    Ubicaciones de credenciales:
      - credentials.json: GOOGLE_APPLICATION_CREDENTIALS o ./credentials.json
      - token.json: ./token.json
    """
    cred_env = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "credentials.json")
    credentials_path = Path(cred_env).resolve()
    token_path = Path("token.json").resolve()
    return credentials_path, token_path


def _load_or_create_credentials(scopes: List[str]) -> Credentials:
    """
    Carga token.json; si no existe o es inválido, inicia flujo OAuth y guarda token.json.
    Refresca el token si está expirado y tiene refresh_token.
    """
    credentials_path, token_path = _credentials_paths()
    creds: Optional[Credentials] = None

    # 1) Intentar cargar token.json
    if token_path.exists():
        try:
            creds = Credentials.from_authorized_user_file(str(token_path), scopes=scopes)
        except Exception:
            creds = None  # archivo corrupto o con scopes incompatibles

    # 2) Refrescar si es posible
    if creds and creds.expired and creds.refresh_token:
        try:
            creds.refresh(Request())
        except Exception:
            creds = None  # forzar nuevo flujo si el refresh falla

    # 3) Si no hay creds válidas, iniciar flujo OAuth
    if not creds or not creds.valid:
        if not credentials_path.exists():
            raise FileNotFoundError(
                f"No se encontró credentials.json en {credentials_path}. "
                f"Define GOOGLE_APPLICATION_CREDENTIALS o coloca el archivo en la raíz."
            )
        flow = InstalledAppFlow.from_client_secrets_file(str(credentials_path), scopes=scopes)
        # run_local_server abre el navegador; port=0 elige uno libre automáticamente
        creds = flow.run_local_server(port=0, prompt="consent")
        # Guardar token.json
        token_path.write_text(creds.to_json(), encoding="utf-8")

    return creds


def get_authenticated_service():
    """
    Devuelve un cliente de Gmail autenticado.
    Respetar:
      - Scopes desde config.json
      - Refresco/creación de token.json
      - cache_discovery deshabilitado (menos ruido)
    """
    global _SERVICE
    if _SERVICE is not None:
        return _SERVICE

    # Si estás en modo fake, permitir que el caller decida (no forzamos error aquí).
    if os.getenv("USE_FAKE_GMAIL", "0") in {"1", "true", "yes"}:
        # Nota: el caller debería evitar llamar Gmail real en modo fake.
        # Devolvemos None para que sea evidente si alguien lo usa por error.
        return None

    scopes = _scopes()
    creds = _load_or_create_credentials(scopes)
    _SERVICE = build("gmail", "v1", credentials=creds, cache_discovery=False)
    return _SERVICE
