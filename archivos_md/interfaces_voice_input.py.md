### .\interfaces\voice_input.py

```py
import whisper
import tempfile
import sounddevice as sd
import numpy as np
import scipy.io.wavfile

def grabar_audio(duracion_segundos=5, sample_rate=16000):
    print("🎙️ Grabando... habla ahora")
    audio = sd.rec(int(duracion_segundos * sample_rate), samplerate=sample_rate, channels=1, dtype='int16')
    sd.wait()
    return audio, sample_rate

def guardar_temporal(audio, sample_rate):
    temp_wav = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
    scipy.io.wavfile.write(temp_wav.name, sample_rate, audio)
    return temp_wav.name

def escuchar_comando():
    audio, sample_rate = grabar_audio()
    wav_path = guardar_temporal(audio, sample_rate)

    model = whisper.load_model("base")
    result = model.transcribe(wav_path)
    print("📝 Transcripción:", result["text"])
    return result["text"]

```