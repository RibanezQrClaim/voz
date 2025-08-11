### .\api_gmail_backend\app.py

```py
import sys
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

# Agregar ruta raíz del proyecto al sys.path
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(BASE_DIR)

from core.intent_detector import detectar_intencion
from core.action_router import ejecutar_accion

app = Flask(__name__)
CORS(app)

@app.route('/api/gmail/comando', methods=['POST'])
def comando_gmail():
    data = request.get_json()
    texto = data.get("comando", "")
    print("🧠 Texto recibido:", texto)

    try:
        intencion = detectar_intencion(texto)
        print("🧠 Intención detectada:", intencion)
        respuesta = ejecutar_accion(intencion, texto)
    except Exception as e:
        print("❌ Error:", e)
        respuesta = f"No entendí el comando: {texto}"

    return jsonify({"respuesta": respuesta})

if __name__ == "__main__":
    app.run(port=5000)

```