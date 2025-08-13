# tools/generar_embeddings.py

import json
import os

LOG_PATH = "logs/intent_log.jsonl"
OUTPUT_PATH = "core/intent_classifier/intents_embeddings.npz"


def generar_embeddings():
    try:
        from sentence_transformers import SentenceTransformer
        import numpy as np
    except ModuleNotFoundError as exc:
        raise ImportError("sentence_transformers y numpy son necesarios para generar embeddings") from exc

    model = SentenceTransformer("all-MiniLM-L6-v2")

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

    embeddings = model.encode(comandos, convert_to_numpy=True)

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    np.savez(OUTPUT_PATH, comandos=comandos, etiquetas=etiquetas, embeddings=embeddings)
    print(f"✅ Embeddings guardados en {OUTPUT_PATH}")


if __name__ == "__main__":
    generar_embeddings()
