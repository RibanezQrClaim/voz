### .\servidor.py

```py
import sys
import os
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from flask import Flask
from flask_cors import CORS
from models.usuario import db
from interfaces.usuarios_api import usuarios_bp
from interfaces.comando_api import comando_bp
from interfaces.filtros_api import filtros_bp
from interfaces.contexto_api import contexto_bp

app = Flask(__name__)

app.register_blueprint(filtros_bp)
CORS(app)  # Permite conexión desde frontend
app.register_blueprint(contexto_bp)
# Configuración base de datos
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///usuarios.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicializar DB
db.init_app(app)
with app.app_context():
    db.create_all()

# Registrar rutas
app.register_blueprint(usuarios_bp)
app.register_blueprint(comando_bp)

# Ruta base
@app.route('/')
def home():
    return 'Servidor Flask activo – API voz_agente_mail ✅'

if __name__ == '__main__':
    app.run(debug=True)

```