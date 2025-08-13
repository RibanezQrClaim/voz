### .\tools\test_knn.py

```py
import sys
import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(BASE_DIR)

from core.intent_classifier.clasificar_comando import clasificar_comando

ejemplos = [
    "¿Qué me llegó más recientemente?",
    "Tengo correos importantes?",
    "Quién me escribió hoy",
    "Cuántos correos sin leer tengo?",
    "Cuál es mi último correo?",
    "Muéstrame los saludos",
    "Hay algo urgente?",
    "Resumen de hoy"
]

for comando in ejemplos:
    print("🧪 Comando:", comando)
    etiqueta = clasificar_comando(comando)
    print("🏷️ Intención detectada:", etiqueta)
    print("-" * 40)

```