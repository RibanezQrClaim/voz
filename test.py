from interfaces.voice_input import escuchar_comando

if __name__ == "__main__":
    texto = escuchar_comando()
    print("🗣️ Lo que dijiste fue:", texto)
