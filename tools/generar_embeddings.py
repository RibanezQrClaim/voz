# tools/generar_embeddings.py

import json
import numpy as np
from sentence_transformers import SentenceTransformer

# Ruta del archivo JSONL de logs
LOG_PATH = "logs/intent_log.jsonl"
OUTPUT_PATH = "core/intent_classifier/intents_embeddings.npz"

# Cargar modelo
model = SentenceTransformer("all-MiniLM-L6-v2")

# Leer los comandos y etiquetas
comandos = []
etiquetas = []

with open(LOG_PATH, "r", encoding="utf-8") as f:
    for line in f:
        entry = json.loads(line)
        comando = entry.get("comando", "").strip()
        intencion = entry.get("intencion", {})
        accion = intencion.get("accion", "desconocido")
        if comando and accion:
            comandos.append(comando)
            etiquetas.append(accion)

# Generar embeddings
embeddings = model.encode(comandos, convert_to_numpy=True)

# Crear carpeta si no existe
import os
os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

# Guardar embeddings, comandos y etiquetas
np.savez(OUTPUT_PATH, comandos=comandos, etiquetas=etiquetas, embeddings=embeddings)

print(f"✅ Embeddings guardados en {OUTPUT_PATH}")
