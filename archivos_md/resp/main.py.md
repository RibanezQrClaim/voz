### .\main.py

```py
# from voz_agente_gmail.interfaces.voice_input import escuchar_comando
# from voz_agente_gmail.core.intent_detector import detectar_intencion
# from voz_agente_gmail.core.action_router import ejecutar_accion
# from voz_agente_gmail.interfaces.voice_output import responder_en_voz

# def ejecutar_agente_voz(contexto_usuario=None):
#     comando = escuchar_comando()
#     intencion = detectar_intencion(comando, contexto_usuario)
#     respuesta = ejecutar_accion(intencion, comando, contexto_usuario)
#     responder_en_voz(respuesta)

from flask import Flask
from voz_agente_gmail.interfaces.gmail_routes import gmail_bp

app = Flask(__name__)
app.register_blueprint(gmail_bp)

if __name__ == "__main__":
    app.run(debug=True)

```