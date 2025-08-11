### .\interfaces\gmail_routes.py

```py
from flask import Blueprint, jsonify, request
from core.gmail.leer import quien_escribio_hoy

gmail_bp = Blueprint('gmail', __name__)

@gmail_bp.route('/api/gmail/quien-escribio-hoy', methods=['GET'])
def endpoint_quien_escribio_hoy():
    user_id = request.args.get('user_id', default='1')
    remitentes = quien_escribio_hoy(user_id)
    return jsonify({'remitentes': remitentes})

```