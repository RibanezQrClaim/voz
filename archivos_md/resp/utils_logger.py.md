### .\utils\logger.py

```py
import os
from datetime import datetime

LOG_DIR = "logs"
os.makedirs(LOG_DIR, exist_ok=True)

def log_usuario(usuario_id, mensaje):
    fecha = datetime.now().strftime("%Y-%m-%d")
    timestamp = datetime.now().strftime("%H:%M:%S")
    nombre_archivo = f"usuario_{usuario_id}_{fecha}.log"
    ruta = os.path.join(LOG_DIR, nombre_archivo)

    with open(ruta, "a", encoding="utf-8") as f:
        f.write(f"[{timestamp}] {mensaje}\n")

```