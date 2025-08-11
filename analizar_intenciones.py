# analizar_intenciones.py

import json
from collections import Counter, defaultdict
from pathlib import Path

log_path = Path("logs/intent_log.jsonl")

if not log_path.exists():
    print("❌ No se encontró el archivo de log.")
    exit()

intenciones = []
usuarios = defaultdict(int)

with log_path.open(encoding="utf-8") as f:
    for linea in f:
        try:
            data = json.loads(linea)
            accion = data["intencion"]["accion"]
            usuario = data["usuario_id"]
            intenciones.append(accion)
            usuarios[usuario] += 1
        except:
            continue

print("\n📊 Top 5 intenciones más usadas:")
for accion, count in Counter(intenciones).most_common(5):
    print(f"   - {accion}: {count} veces")

print("\n⚠️ Comandos no entendidos (desconocido):", intenciones.count("desconocido"))

print("\n👤 Comandos por usuario:")
for usuario, count in usuarios.items():
    print(f"   - Usuario {usuario}: {count} comandos")

print("\n✅ Análisis completo.\n")
