import os

os.environ["USE_FAKE_GMAIL"] = "1"
os.environ["FAKE_EMAILS_PATH"] = "tests/fixtures/emails_home.json"

from core.gmail import listar, leer_ultimo, remitentes_hoy, contar_no_leidos, buscar

def test_listar():
    assert len(listar()) == 20

def test_leer_ultimo():
    assert leer_ultimo().get("id") == "m_00071"

def test_remitentes_hoy():
    assert remitentes_hoy() == []

def test_contar_no_leidos():
    assert contar_no_leidos() == 200

def test_buscar():
    assert buscar("project") == []
