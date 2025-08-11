### .\core\intent_detector.py

```py
import openai
import json  # 👈 Faltaba este

openai.api_key = "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"  # tu clave
openai.api_base = "https://openrouter.ai/api/v1"

def detectar_intencion(texto_usuario, contexto=None):
    prompt = f"""
Eres un asistente que interpreta comandos de voz para Gmail.

Convierte este texto en una acción estructurada en JSON. Usa comillas dobles y valores booleanos válidos.
Ejemplo:
Usuario: "¿Tengo correos sin leer?"
Respuesta:
{{"accion": "listar_correos", "filtros": {{"sin_leer": true}}}}

Usuario: "{texto_usuario}"
Respuesta:
"""

    response = openai.ChatCompletion.create(
        model="mistralai/mistral-7b-instruct:free",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )

    contenido = response.choices[0].message.content.strip()
    print("📦 Contenido generado por LLM:", contenido)  # 👈 DEBUG

    try:
        return json.loads(contenido)
    except json.JSONDecodeError as e:
        print("❌ Error al interpretar JSON:", e)
        print("📦 Texto crudo:", contenido)
        return None

```