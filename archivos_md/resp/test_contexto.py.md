### .\test_contexto.py

```py
from core.contexto import cargar_contexto, cargar_filtros

usuario_id = 1

print("📂 Contexto cargado:")
print(cargar_contexto(usuario_id))

print("\n🔍 Filtros cargados:")
print(cargar_filtros(usuario_id))

```