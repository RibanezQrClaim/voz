import pytest

pytest.importorskip("sentence_transformers")
pytest.importorskip("sklearn")

from core.intent_detector import detectar_intencion

texto = "¿Qué me escribió Juan?"
print(detectar_intencion(texto))
