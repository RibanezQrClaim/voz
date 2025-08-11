### .\interfaces\contexto_api.py

```py
from flask import Blueprint, request, jsonify
from core.contexto import cargar_contexto, _ruta_contexto
import json
import os

contexto_bp = Blueprint('contexto', __name__, url_prefix='/usuarios')

@contexto_bp.route('/<int:usuario_id>/contexto', methods=['GET'])
def obtener_contexto(usuario_id):
    contexto = cargar_contexto(usuario_id)
    return jsonify(contexto)

@contexto_bp.route('/<int:usuario_id>/contexto', methods=['PUT'])
def actualizar_contexto(usuario_id):
    nuevo_contexto = request.get_json()
    if not isinstance(nuevo_contexto, dict):
        return jsonify({"error": "Formato inválido"}), 400

    ruta = _ruta_contexto(usuario_id)
    os.makedirs(os.path.dirname(ruta), exist_ok=True)
    with open(ruta, 'w', encoding='utf-8') as f:
        json.dump(nuevo_contexto, f, indent=2, ensure_ascii=False)

    return jsonify({"mensaje": "Contexto actualizado correctamente"})

```