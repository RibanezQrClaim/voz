### .\test_resumen.py

```py
from core.llm.llm_client import resumir_texto_llm

correos_mock = """
1. Reunión reagendada con proveedor para el jueves.
2. Nuevo correo de RRHH sobre beneficios 2025.
3. Cliente X confirmó compra y pide seguimiento.
4. Recordatorio: enviar informe mensual antes del viernes.
5. Invitación a webinar de productividad.
"""

print("🔎 Texto original:")
print(correos_mock)

print("\n📉 Resumen generado:")
print(resumir_texto_llm(correos_mock))

```