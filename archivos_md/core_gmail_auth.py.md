### .\core\gmail\auth.py

```py
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import json

def get_authenticated_service():
    """
    Carga las credenciales desde token.json y construye el cliente de Gmail API.
    """
    with open("token.json", "r", encoding="utf-8") as token_file:
        creds_data = json.load(token_file)

    creds = Credentials.from_authorized_user_info(info=creds_data)
    service = build('gmail', 'v1', credentials=creds)
    return service

```