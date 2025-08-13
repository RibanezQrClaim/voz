try:
    import pyttsx3
except ModuleNotFoundError:
    pyttsx3 = None


def responder_en_voz(texto):
    if pyttsx3 is None:
        raise ImportError("pyttsx3 es necesario para responder en voz")
    engine = pyttsx3.init()
    engine.setProperty('rate', 160)
    engine.setProperty('volume', 1.0)
    engine.say(texto)
    engine.runAndWait()
