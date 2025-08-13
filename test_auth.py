import pytest

pytest.skip(reason="requires real Gmail auth", allow_module_level=True)

from interfaces.gmail_api import autenticar_gmail  # pragma: no cover

autenticar_gmail()
print("✅ Autenticación completada")
