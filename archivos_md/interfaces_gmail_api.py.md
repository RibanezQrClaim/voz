### .\interfaces\gmail_api.py

```py
from flask import session
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

# Scopes que usaste en el login OAuth
SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/calendar.readonly"
]

# ✅ Construye el servicio Gmail desde la sesión activa
def construir_service_gmail(usuario_id=None):
    creds_dict = session.get("credentials")
    if not creds_dict:
        return None  # Usuario no autenticado aún

    creds = Credentials(
        token=creds_dict['token'],
        refresh_token=creds_dict.get('refresh_token'),
        token_uri=creds_dict['token_uri'],
        client_id=creds_dict['client_id'],
        client_secret=creds_dict['client_secret'],
        scopes=creds_dict['scopes']
    )

    return build('gmail', 'v1', credentials=creds)


# ✅ Extra: función opcional para obtener correos (solo si la usas)
def obtener_correos_recientes(cantidad=5):
    service = construir_service_gmail()
    if not service:
        return ["⚠️ No has conectado tu cuenta de Gmail."]

    results = service.users().messages().list(
        userId='me', labelIds=['INBOX'], maxResults=cantidad).execute()
    mensajes = results.get('messages', [])

    lista = []
    for msg in mensajes:
        detalle = service.users().messages().get(userId='me', id=msg['id']).execute()
        headers = detalle['payload'].get('headers', [])
        asunto = next((h['value'] for h in headers if h['name'] == 'Subject'), '(Sin asunto)')
        remitente = next((h['value'] for h in headers if h['name'] == 'From'), '(Sin remitente)')
        lista.append(f"📩 {asunto} — de {remitente}")
    return lista

```