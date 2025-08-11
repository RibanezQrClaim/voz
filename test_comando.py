import requests
from datetime import datetime

# URL del endpoint Flask
URL = "http://localhost:5000/comando/"
usuario_id = 1

comandos = [
    "¿Quién me escribió hoy?",
    "Resúmeme los correos de hoy"
]

for comando in comandos:
    print(f"\n🧪 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} - Probando: {comando}")
    payload = {
        "comando": comando,
        "usuario_id": usuario_id
    }

    try:
        response = requests.post(URL, json=payload)
        data = response.json()
        print("📬 Respuesta:")
        print(data.get("respuesta"))
    except Exception as e:
        print("❌ Error:", e)
