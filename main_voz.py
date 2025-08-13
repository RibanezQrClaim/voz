try:
    import speech_recognition as sr
except ModuleNotFoundError:
    sr = None
try:
    import pyttsx3
except ModuleNotFoundError:
    pyttsx3 = None

from core.intent_detector import detectar_intencion
from core.action_router import ejecutar_accion
from core.gmail.auth import get_authenticated_service

if pyttsx3:
    voz = pyttsx3.init()
    voz.setProperty('rate', 160)
else:
    voz = None


def hablar(texto):
    if voz is None:
        raise ImportError("pyttsx3 es necesario para salida de voz")
    print("📣", texto)
    voz.say(texto)
    voz.runAndWait()


def escuchar():
    if sr is None:
        raise ImportError("speech_recognition es necesario para entrada de voz")
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        print("🎤 Escuchando... habla ahora.")
        audio = recognizer.listen(source)

    try:
        texto = recognizer.recognize_google(audio, language="es-CL")
        print("🗣️ Dijiste:", texto)
        return texto
    except sr.UnknownValueError:
        return "No entendí lo que dijiste."
    except sr.RequestError as e:
        return f"Error al conectar con Google: {e}"


def main():
    comando = escuchar()

    if not comando or "no entendí" in comando:
        hablar("No entendí lo que dijiste. Intenta de nuevo.")
        return

    servicio = get_authenticated_service()
    contexto = {"user_id": "1", "service": servicio}

    intencion = detectar_intencion(comando)
    respuesta = ejecutar_accion(intencion, comando=comando, contexto=contexto)

    hablar(respuesta)


if __name__ == "__main__":
    main()
