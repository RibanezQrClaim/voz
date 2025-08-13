import tempfile

try:
    import sounddevice as sd
except ModuleNotFoundError:
    sd = None
try:
    import scipy.io.wavfile as wavfile
except ModuleNotFoundError:
    wavfile = None
try:
    import whisper
except ModuleNotFoundError:
    whisper = None


def grabar_audio(duracion_segundos=5, sample_rate=16000):
    if sd is None:
        raise ImportError("sounddevice es necesario para grabar audio")
    print("🎙️ Grabando... habla ahora")
    audio = sd.rec(int(duracion_segundos * sample_rate), samplerate=sample_rate, channels=1, dtype="int16")
    sd.wait()
    return audio, sample_rate


def guardar_temporal(audio, sample_rate):
    if wavfile is None:
        raise ImportError("scipy es necesario para guardar audio")
    temp_wav = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
    wavfile.write(temp_wav.name, sample_rate, audio)
    return temp_wav.name


def escuchar_comando():
    if whisper is None:
        raise ImportError("openai-whisper es necesario para transcribir audio")
    audio, sample_rate = grabar_audio()
    wav_path = guardar_temporal(audio, sample_rate)

    model = whisper.load_model("base")
    result = model.transcribe(wav_path)
    print("📝 Transcripción:", result["text"])
    return result["text"]
