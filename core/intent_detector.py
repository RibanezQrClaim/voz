from core.intent_classifier import clasificar_comando

def detectar_intencion(texto_usuario, contexto=None):
    """
    Detecta la intención del usuario usando embeddings + KNN.
    Ya devuelve la acción directamente, no requiere mapeo.
    """
    resultado = clasificar_comando(texto_usuario)
    print(f"📦 Intención detectada por KNN: {resultado}")
    return resultado
