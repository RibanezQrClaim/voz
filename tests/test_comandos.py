import os

os.environ["USE_FAKE_GMAIL"] = "1"
os.environ["FAKE_EMAILS_PATH"] = "tests/fixtures/emails_home.json"

import importlib.util
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT))
import core.action_router as router

spec = importlib.util.spec_from_file_location(
    "api_app", ROOT / "api_gmail_backend" / "app.py"
)
api_app = importlib.util.module_from_spec(spec)
spec.loader.exec_module(api_app)
app = api_app.app


def test_comandos():
    app.testing = True
    client = app.test_client()

    original_contar = router.contar_no_leidos
    original_remitentes = router.remitentes_hoy
    original_resumen = router.resumen_correos_hoy

    router.contar_no_leidos = lambda: 3
    router.remitentes_hoy = lambda: ["alice@example.com"]
    router.resumen_correos_hoy = lambda cantidad=10: "uno\n-----\ndos"

    try:
        resp = client.post("/api/gmail/comando", json={"comando": "¿Tengo correos sin leer?"})
        assert resp.status_code == 200
        assert any(ch.isdigit() for ch in resp.get_json()["respuesta"])

        resp = client.post("/api/gmail/comando", json={"comando": "¿Quién me escribió hoy?"})
        assert resp.status_code == 200
        assert isinstance(resp.get_json()["respuesta"], list)

        resp = client.post("/api/gmail/comando", json={"comando": "Dame un resumen de hoy"})
        assert resp.status_code == 200
        assert "-----" in resp.get_json()["respuesta"]
    finally:
        router.contar_no_leidos = original_contar
        router.remitentes_hoy = original_remitentes
        router.resumen_correos_hoy = original_resumen
