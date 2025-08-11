### .\core\intent_classifier.py

```py
from sentence_transformers import SentenceTransformer
from sklearn.neighbors import KNeighborsClassifier
import numpy as np

# Modelo liviano y rápido para producción local
modelo = SentenceTransformer("all-MiniLM-L6-v2")

# Dataset de intenciones (puedes expandirlo)
dataset = {
    "leer_ultimo": [
        "lee el último correo",
        "muéstrame el más reciente",
        "quiero ver el correo nuevo",
        "cuál es mi último correo",
        "cuál es el correo más reciente",
        "dime el último mensaje recibido",
        "qué me llegó más recientemente",
        "cuál fue el último mail",
        "ver mensaje más reciente",
        "muéstrame el último mensaje que tengo",
    ],
    "resumir": [
        "resúmeme los correos",
        "dame un resumen de hoy",
        "cuéntame lo importante",
        "resumen ejecutivo",
        "hazme un resumen",
        "resumen del día",
        "qué dicen los correos",
    ],
    "sin_leer": [
        "tengo correos sin leer",
        "cuántos no he leído",
        "cuántos correos nuevos",
        "hay mensajes sin leer",
        "hay correos pendientes",
        "hay mails que no he abierto",
    ],
    "importantes": [
        "hay algo urgente",
        "tengo correos importantes",
        "algo que deba ver ya",
        "hay algo prioritario",
        "me llegó algo importante",
        "hay urgentes?",
    ],
    "remitentes": [
        "quién me escribió hoy",
        "nombres de los que mandaron correos",
        "quiénes me mandaron mails",
        "quién me ha escrito",
        "de quién son los correos de hoy",
        "quiénes me enviaron correos hoy",
    ],
    "desconocido": [
        "dime un chiste",
        "hace calor en santiago",
        "cuál es tu color favorito",
        "cómo está el clima",
        "quién ganó el partido",
    ]
}

# Preparar datos para entrenamiento
frases = []
etiquetas = []

for etiqueta, ejemplos in dataset.items():
    frases.extend(ejemplos)
    etiquetas.extend([etiqueta] * len(ejemplos))

# Generar embeddings
X = modelo.encode(frases)
y = np.array(etiquetas)

# Entrenar clasificador KNN
knn = KNeighborsClassifier(n_neighbors=1)
knn.fit(X, y)

def clasificar_comando(texto):
    """
    Devuelve la intención más cercana a partir del texto del usuario.
    """
    emb = modelo.encode([texto])
    pred = knn.predict(emb)[0]
    print(f"🔍 Intención detectada por KNN:", pred)
    return {
        "accion": {
            "leer_ultimo": "leer_ultimo",
            "resumir": "resumen_hoy",
            "sin_leer": "contar_no_leidos",
            "importantes": "correos_importantes",
            "remitentes": "remitentes_hoy",
        }.get(pred, "desconocido")
    }

```