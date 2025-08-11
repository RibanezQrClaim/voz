### .\interfaces\comando_api.py

```py
from flask import Blueprint, request, jsonify
# from interfaces.voice_input import transcribir_audio  # si usas voz
from core.intent_detector import detectar_intencion
from core.action_router import ejecutar_accion
from core.contexto import cargar_contexto, cargar_filtros
from utils.logger import log_usuario

comando_bp = Blueprint('comando', __name__, url_prefix='/comando')

@comando_bp.route('/', methods=['POST'])
def procesar_comando():
    try:
        data = request.get_json()
        print("📥 JSON recibido:", data)

        comando = data.get("comando")
        usuario_id = data.get("usuario_id")

        if not comando or not usuario_id:
            return jsonify({"error": "Faltan 'comando' o 'usuario_id'"}), 400

        log_usuario(usuario_id, f"🗣️ Comando recibido: {comando}")

        contexto = cargar_contexto(usuario_id)
        filtros = cargar_filtros(usuario_id)

        intencion = detectar_intencion(comando, contexto)
        log_usuario(usuario_id, f"🔍 Intención detectada: {intencion}")

        respuesta = ejecutar_accion(intencion, comando, contexto, filtros)
        log_usuario(usuario_id, f"📤 Respuesta generada: {respuesta}")

        return jsonify({"respuesta": respuesta})
    
    except Exception as e:
        error_msg = f"❌ Error en procesamiento: {str(e)}"
        print(error_msg)
        usuario_id = data.get("usuario_id", "desconocido")
        log_usuario(usuario_id, error_msg)
        return jsonify({"error": "Error interno del servidor."}), 500

```