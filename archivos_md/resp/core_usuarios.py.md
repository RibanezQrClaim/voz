### .\core\usuarios.py

```py
from models.usuario import db, Usuario

def crear_usuario(nombre, email):
    nuevo = Usuario(nombre=nombre, email=email)
    db.session.add(nuevo)
    db.session.commit()
    return nuevo

def obtener_usuario(id):
    return Usuario.query.get(id)

def actualizar_usuario(id, datos):
    usuario = Usuario.query.get(id)
    if not usuario:
        return None
    for key, value in datos.items():
        setattr(usuario, key, value)
    db.session.commit()
    return usuario

def eliminar_usuario(id):
    usuario = Usuario.query.get(id)
    if usuario:
        db.session.delete(usuario)
        db.session.commit()
        return True
    return False

def listar_usuarios():
    return Usuario.query.all()

```