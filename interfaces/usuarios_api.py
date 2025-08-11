from flask import Blueprint, request, jsonify
from core.usuarios import crear_usuario, obtener_usuario, actualizar_usuario, eliminar_usuario, listar_usuarios

usuarios_bp = Blueprint('usuarios', __name__, url_prefix='/usuarios')

@usuarios_bp.route('/', methods=['GET'])
def get_usuarios():
    usuarios = listar_usuarios()
    return jsonify([{
        'id': u.id,
        'nombre': u.nombre,
        'email': u.email,
        'activo': u.activo,
        'fecha_creacion': u.fecha_creacion.isoformat()
    } for u in usuarios])

@usuarios_bp.route('/', methods=['POST'])
def post_usuario():
    data = request.json
    nuevo = crear_usuario(data['nombre'], data['email'])
    return jsonify({'id': nuevo.id, 'nombre': nuevo.nombre, 'email': nuevo.email}), 201

@usuarios_bp.route('/<int:id>', methods=['GET'])
def get_usuario(id):
    u = obtener_usuario(id)
    if not u:
        return jsonify({'error': 'No encontrado'}), 404
    return jsonify({'id': u.id, 'nombre': u.nombre, 'email': u.email, 'activo': u.activo})

@usuarios_bp.route('/<int:id>', methods=['PUT'])
def put_usuario(id):
    data = request.json
    actualizado = actualizar_usuario(id, data)
    if not actualizado:
        return jsonify({'error': 'No encontrado'}), 404
    return jsonify({'mensaje': 'Usuario actualizado'})

@usuarios_bp.route('/<int:id>', methods=['DELETE'])
def delete_usuario(id):
    ok = eliminar_usuario(id)
    return jsonify({'mensaje': 'Eliminado' if ok else 'No encontrado'}), 200 if ok else 404
