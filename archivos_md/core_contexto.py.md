### .\core\contexto.py

```py
import os
import json

DATA_DIR = "data"

def _ruta_contexto(usuario_id):
    return os.path.join(DATA_DIR, f"contexto_{usuario_id}.json")

def _ruta_filtros(usuario_id):
    return os.path.join(DATA_DIR, f"filtros_{usuario_id}.json")

def _asegurar_archivo(path, contenido_default):
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(path):
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(contenido_default, f, indent=2)

def cargar_contexto(usuario_id):
    path = _ruta_contexto(usuario_id)
    _asegurar_archivo(path, {"empresa": "", "correos_internos": [], "contactos_frecuentes": []})
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def cargar_filtros(usuario_id):
    path = _ruta_filtros(usuario_id)
    _asegurar_archivo(path, {"urgente": ["urgente", "inmediato"], "proveedor": ["factura", "pedido"]})
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

```