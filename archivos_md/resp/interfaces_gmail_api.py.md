### .\interfaces\gmail_api.py

```py
import os.path
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

# Scope mínimo para leer correos
SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

def autenticar_gmail():
    creds = None
    token_path = os.path.join(os.path.dirname(__file__), '..', 'token.json')
    token_path = os.path.abspath(token_path)

    if os.path.exists(token_path):
        creds = Credentials.from_authorized_user_file(token_path, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            cred_path = os.path.join(os.path.dirname(__file__), '..', 'credentials.json')
            cred_path = os.path.abspath(cred_path)
            flow = InstalledAppFlow.from_client_secrets_file(cred_path, SCOPES)
            creds = flow.run_local_server(port=0)
        with open(token_path, 'w') as token:
            token.write(creds.to_json())

    return build('gmail', 'v1', credentials=creds)

def obtener_correos_recientes(cantidad=5):
    service = autenticar_gmail()
    results = service.users().messages().list(userId='me', labelIds=['INBOX'], maxResults=cantidad).execute()
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