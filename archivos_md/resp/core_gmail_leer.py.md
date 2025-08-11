### .\core\gmail\leer.py

```py
from datetime import datetime
from googleapiclient.discovery import build
from voz_agente_gmail.utils.gmail_auth import get_gmail_service
from utils.dates import get_rfc3339_today

def quien_escribio_hoy(user_id):
    """Devuelve una lista de remitentes únicos que enviaron correos hoy"""
    service = get_gmail_service(user_id)
    today_rfc3339 = get_rfc3339_today()

    query = f"after:{today_rfc3339} is:inbox"
    results = service.users().messages().list(userId='me', q=query, maxResults=50).execute()
    messages = results.get('messages', [])

    remitentes = set()
    for msg in messages:
        detalle = service.users().messages().get(userId='me', id=msg['id'], format='metadata', metadataHeaders=['From']).execute()
        headers = detalle.get('payload', {}).get('headers', [])
        for h in headers:
            if h['name'] == 'From':
                remitentes.add(h['value'])

    return list(remitentes)

```