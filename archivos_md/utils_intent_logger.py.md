### .\utils\intent_logger.py

```py
# utils/intent_logger.py

from datetime import datetime
import json
import os

log_path = "logs/intent_log.jsonl"
os.makedirs("logs", exist_ok=True)

def log_intencion(usuario_id, comando, intencion):
    """
    Guarda cada comando detectado con su intención, usuario y timestamp.
    """
    entrada = {
        "ts": datetime.now().isoformat(),
        "usuario_id": usuario_id,
        "comando": comando,
        "intencion": intencion
    }
    with open(log_path, "a", encoding="utf-8") as f:
        f.write(json.dumps(entrada, ensure_ascii=False) + "\n")

```