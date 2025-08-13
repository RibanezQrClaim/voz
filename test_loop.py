import pytest

pytest.importorskip("sentence_transformers")
pytest.importorskip("sklearn")
pytest.importorskip("sounddevice")
pytest.importorskip("pyttsx3")

from interfaces.voice_input import escuchar_comando
from core.intent_detector import detectar_intencion
from core.action_router import ejecutar_accion
from interfaces.voice_output import responder_en_voz

if __name__ == "__main__":
    texto = escuchar_comando()
    print("📝 Transcripción:", texto)

    intencion = detectar_intencion(texto)
    print("🧠 Intención detectada:", intencion)

    respuesta = ejecutar_accion(intencion, texto)
    print("🤖 Respuesta generada:", respuesta)

    responder_en_voz(respuesta)
