# main.py
import os
import sys

# Asegura imports relativos al correr desde la raíz del proyecto
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Cargar configuración principal desde config.json
from utils.config import load_config
try:
    from utils.config import CONFIG  # dict con la config anidada (opcional)
except Exception:
    CONFIG = {}

# 1) Cargar config.json (inyecta os.environ y prepara CONFIG si corresponde)
load_config()

# 2) (Opcional) Cargar .env SOLO para variables faltantes (no override a config.json)
try:
    from dotenv import load_dotenv
    load_dotenv(override=False)
except Exception:
    pass

# ---- Helpers para tomar primero ENV y luego CONFIG ----
def _cfg(path: str, default=None):
    cur = CONFIG or []
    try:
        for p in path.split("."):
            cur = cur[p]
        return cur
    except Exception:
        return default

def get_host() -> str:
    return os.getenv("HOST") or str(_cfg("app.host", "127.0.0.1"))

def get_port() -> int:
    env_port = os.getenv("PORT")
    if env_port:
        try:
            return int(env_port)
        except ValueError:
            pass
    return int(_cfg("app.port", 8000))

def get_secret_key() -> str:
    return os.getenv("APP_SECRET_KEY") or str(_cfg("app.secret_key", "clave_secreta_123"))

def get_llm_mode() -> str:
    return os.getenv("LLM_MODE") or str(_cfg("llm.mode", "off"))

def get_llm_model_path() -> str:
    return os.getenv("LLM_MODEL_PATH") or str(_cfg("llm.local_model_path", ""))

# 3) Cargar versión desde archivo VERSION (si no existe, usar "dev")
VERSION_FILE = os.path.join(os.path.dirname(__file__), "VERSION")
try:
    with open(VERSION_FILE, "r", encoding="utf-8") as f:
        PROJECT_VERSION = f.read().strip() or "dev"
except FileNotFoundError:
    PROJECT_VERSION = "dev"

# Debug rápido
print(f"LLM_MODE={get_llm_mode()}  MODEL={get_llm_model_path()}")

# ⬇️ añadimos request/jsonify y mantenemos lo tuyo
from flask import Flask, send_from_directory, request, jsonify
from flask_cors import CORS

# Blueprints del proyecto
from interfaces.gmail_routes import gmail_bp
from interfaces.comando_api import comando_bp  # 🎯 Director de orquesta
from interfaces.auth_routes import auth_bp     # 🔐 Login/Logout Gmail
from interfaces.health_api import register_health  # 🩺 Nuevo endpoint /health

app = Flask(__name__)
app.secret_key = get_secret_key()
CORS(app)

# Registrar Blueprints
app.register_blueprint(gmail_bp)
app.register_blueprint(comando_bp)
app.register_blueprint(auth_bp)
register_health(app)  # <<< registro del /health

# Servir la interfaz visual (HTML)
@app.route("/")
def home():
    return send_from_directory("frontend", "index_bloques.html")

# Estáticos
@app.route("/static/<path:filename>")
def static_files(filename):
    return send_from_directory("frontend", filename)

# --- API del agente: stub mínimo para el frontend ---
@app.route("/api/chat", methods=["POST"])
def api_chat():
    data = request.get_json(silent=True) or {}
    msg = (data.get("message") or "").strip()
    if not msg:
        return jsonify(reply="Escribe algo y te ayudo."), 200
    # TODO: conecta aquí tu orquestador real (Gmail/Calendar/LLM)
    return jsonify(reply=f"Echo: {msg}"), 200

if __name__ == "__main__":
    host = get_host()
    port = get_port()
    print(f"🚀 Voz Agente Gmail v{PROJECT_VERSION} iniciando en http://{host}:{port}")
    # Evita doble proceso del reloader en Windows
    app.run(debug=True, host=host, port=port, use_reloader=False, threaded=True)
