### .\interfaces\voice_output.py

```py
# interfaces/voice_output.py
import pyttsx3

def responder_en_voz(texto):
    engine = pyttsx3.init()
    engine.setProperty('rate', 160)      # Velocidad de la voz
    engine.setProperty('volume', 1.0)    # Volumen (0.0 a 1.0)
    engine.say(texto)
    engine.runAndWait()
```