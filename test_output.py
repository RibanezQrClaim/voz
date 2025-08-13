import pytest

pytest.importorskip("pyttsx3")

from interfaces.voice_output import responder_en_voz

if __name__ == "__main__":
    responder_en_voz("Hola, ¿cómo estás? Soy tu asistente de correo.")
