### .\interfaces\filtros_api.py

```py
from flask import Blueprint, request, jsonify
from core.contexto import cargar_filtros, _ruta_filtros
import json
import os

filtros_bp = Blueprint('filtros', __name__, url_prefix='/usuarios')

@filtros_bp.route('/<int:usuario_id>/filtros', methods=['GET'])
def obtener_filtros(usuario_id):
    filtros = cargar_filtros(usuario_id)
    return jsonify(filtros)

@filtros_bp.route('/<int:usuario_id>/filtros', methods=['PUT'])
def actualizar_filtros(usuario_id):
    nuevos_filtros = request.get_json()
    if not isinstance(nuevos_filtros, dict):
        return jsonify({"error": "Formato inválido"}), 400

    ruta = _ruta_filtros(usuario_id)
    os.makedirs(os.path.dirname(ruta), exist_ok=True)
    with open(ruta, 'w', encoding='utf-8') as f:
        json.dump(nuevos_filtros, f, indent=2, ensure_ascii=False)

    return jsonify({"mensaje": "Filtros actualizados correctamente"})

```