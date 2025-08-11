from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
import os

def get_gmail_service(usuario_id=None):
    creds_path = "credentials.json"
    token_path = f"token_{usuario_id}.json" if usuario_id else "token.json"

    if not os.path.exists(token_path):
        raise Exception(f"Token no encontrado: {token_path}")

    creds = Credentials.from_authorized_user_file(token_path)
    service = build('gmail', 'v1', credentials=creds)
    return service
