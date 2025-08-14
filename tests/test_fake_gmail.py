import os
import importlib
import os
import importlib

os.environ["USE_FAKE_GMAIL"] = "1"
FIXTURE = "tests/fixtures/emails_home.json"


def _reload_gmail(monkeypatch, *, path: str | None = None, file: str | None = None):
    if path:
        monkeypatch.setenv("FAKE_EMAILS_PATH", path)
    else:
        monkeypatch.delenv("FAKE_EMAILS_PATH", raising=False)
    if file:
        monkeypatch.setenv("FAKE_EMAILS_FILE", file)
    else:
        monkeypatch.delenv("FAKE_EMAILS_FILE", raising=False)
    import core.gmail as gmail
    importlib.reload(gmail)
    return gmail


def test_listar(monkeypatch):
    gmail = _reload_gmail(monkeypatch, path=FIXTURE)
    assert len(gmail.listar()) == 20


def test_leer_ultimo(monkeypatch):
    gmail = _reload_gmail(monkeypatch, path=FIXTURE)
    assert gmail.leer_ultimo().get("id") == "m_00071"


def test_remitentes_hoy(monkeypatch):
    gmail = _reload_gmail(monkeypatch, path=FIXTURE)
    assert gmail.remitentes_hoy() == []


def test_contar_no_leidos(monkeypatch):
    gmail = _reload_gmail(monkeypatch, path=FIXTURE)
    assert gmail.contar_no_leidos() == 200


def test_buscar(monkeypatch):
    gmail = _reload_gmail(monkeypatch, path=FIXTURE)
    assert gmail.buscar("project") == []


def test_fixture_via_file(monkeypatch):
    gmail = _reload_gmail(monkeypatch, file=FIXTURE)
    assert len(gmail.listar()) == 20

