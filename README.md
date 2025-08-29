# README — Voz Agente Gmail (MVP + H4 Robustez)

## Quick start
1) npm install
2) npm run sync:figma
3) npm run dev:app
4) npm run build:all / npm run typecheck:all

## 🚀 Descripción
Asistente (voz/texto) para **Gmail**: consulta, resume y prioriza correos. Funciona en:
- **Fake** (fixtures JSON) — ideal para dev/QA.
- **Real** (API Gmail + OAuth) — con **backoff**, **paginación**, **fields** mínimos y **errores amables** (H4).

Toda la config vive en **`config.json`** (fuente única). No necesitas editar código para cambiar límites/fields.

---

## 📂 Estructura
```
voz_agente_gmail/
│
├── main.py
├── config.json
├── utils/
│   ├── config.py          # carga config + compat ENV
│   ├── logger.py          # log_event/log_error + Timer
│   ├── retry.py           # backoff 3 intentos + jitter (H4)
│   ├── summarizer.py      # resumen (opcional)
│   ├── importance.py      # ranking importante (opcional)
│   └── fake_gmail.py      # backend fake (fixtures)
├── core/
│   ├── action_router.py   # router de intents
│   └── gmail/
│       ├── auth.py        # OAuth + build service Gmail
│       ├── leer.py        # list/get robusto (H4)
│       └── buscar.py      # búsqueda robusta (H4)
├── interfaces/
│   └── comando_api.py     # POST /api/comando (observabilidad H4)
└── tests/fixtures/
    ├── emails_home.json
    └── contacts_retail.json
```

---

## ⚙️ Configuración (extracto relevante)
En `config.json` (sección `gmail`):
```json
"gmail": {
  "scopes": ["gmail.readonly", "gmail.modify"],
  "fake_emails_path": "tests/fixtures/emails_home.json",
  "fake_contacts_path": "tests/fixtures/contacts_retail.json",
  "primary_email": "carolina@home.cl",
  "timezone": "America/Santiago",

  "max_results": 10,
  "backoff_max_tries": 3,
  "backoff_base_ms": 200,
  "backoff_jitter_ms": 100,

  "fields_list": "messages(id),nextPageToken",
  "fields_get": "id,internalDate,labelIds,snippet,payload(headers(name,value))",
  "headers_get": ["From","Subject","Date","To","Cc"],

  "excluded_labels": [
    "CATEGORY_SOCIAL","CATEGORY_PROMOTIONS","CATEGORY_UPDATES",
    "CATEGORY_FORUMS","SPAM","TRASH"
  ]
}
```
> Ajusta valores aquí. **No** hardcodear en Python.

---

## ▶️ Ejecución

1) Instalar deps
```bash
pip install -r requirements.txt
```

2) **Fake** (por defecto si existe `tests/fixtures/emails_home.json`)
```bash
python main.py
# http://127.0.0.1:8000
```

3) **Real** (API Gmail)
- Deja `credentials.json` en la raíz o define `GOOGLE_APPLICATION_CREDENTIALS=./credentials.json`.
- Asegúrate de que **USE_FAKE_GMAIL** no esté en `1` (se infiere desde `FAKE_EMAILS_PATH`).
- Primer arranque pedirá consentimiento OAuth y generará `token.json`.

---

## 🧠 Intents listos (MVP)
- `remitentes_hoy`, `contar_no_leidos`, `leer_ultimo`
- `resumen_hoy` (usa summarizer si está disponible)
- `correos_importantes`
- `buscar_correo` (texto libre)

### Endpoint
`POST /api/comando`
```json
{ "texto": "¿Quién me escribió hoy?", "usuario_id": "1" }
```

---

## 🛡️ H4 — Robustez (qué hace)
- **Backoff 3 intentos + jitter** ante 429/403 rate/5xx (`utils/retry.py`).
- **Paginación segura** hasta `gmail.max_results` con `nextPageToken`.
- **`fields=` mínimos** en `list/get` + filtrado de headers.
- **Errores amables** tras 3 fallos (mensaje claro por acción).
- **Observabilidad**: logs con `retries_by_code`, `slept_ms_total`, `last_error`, `duration_ms`.

### Log esperado
Archivo: `logs/usuario_<id>_YYYY-MM-DD.log`
```
[12:45:03] accion=remitentes_hoy backend=real duration_ms=842.31 ok=True items=8 extra={'endpoint': '/api/comando', 'retries_by_code': {'429': 1}, 'slept_ms_total': 600}
```

---

## ✅ QA rápido (H4)
1. **Fake**: ejecuta comandos y valida que respeta `max_results` y no rompe.
2. **Real**:
   - Setea `"max_results": 5` → confírma corte exacto.
   - Compara latencia **con y sin** `fields_*` (debe bajar).
   - Provoca 429/403 (carga o token caducado) → ver `retries_by_code` y mensaje amable.

---

## 🔧 Troubleshooting
- **401/403 (no rate)**: re-autenticar (borra `token.json` y vuelve a iniciar).
- **`credentials.json` faltante**: define `GOOGLE_APPLICATION_CREDENTIALS` o coloca el archivo en raíz.
- **Modo fake forzado**: exporta `USE_FAKE_GMAIL=1` o asegúrate de que `FAKE_EMAILS_PATH` exista.

---

## 🧱 Principios
Simple, modular, limpio, escalable. Config única, contratos estables y logs accionables.
