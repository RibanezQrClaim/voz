# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [v0.2.0-h4] - 2025-08-23
### Added
- **Robustez H4: Backoff con jitter** (3 intentos) para llamadas Gmail `messages.list` y `messages.get` (`utils/retry.py`), con métrica `retries_by_code`, `slept_ms_total`, `attempts`.
- **Paginación segura** por `nextPageToken` con corte estricto por `gmail.max_results`.
- **Campos mínimos (`fields=`)**: `fields_list` y `fields_get` + filtrado de headers (`headers_get`).
- **Mensajes de error amables** tras 3 fallos (`RetryError`) en `interfaces/comando_api.py`.
- **Observabilidad**: `utils/logger.py` con `log_event`, `log_error` y `Timer`; logging de métricas de retry (éxitos/fallos) desde `comando_api`.
- **Configuración centralizada** en `config.json` (sección `gmail`): 
  - `max_results`, `backoff_max_tries`, `backoff_base_ms`, `backoff_jitter_ms`
  - `fields_list`, `fields_get`, `headers_get`, `excluded_labels`
  - `primary_email`, `timezone`
- **Abstracción fake/real** en `core/gmail/__init__.py` (fallback para `buscar` en fake, `GMAIL_TIMING` opcional).
- **Router de intents** `core/action_router.py` usa `core.gmail` (respeta fake/real).
- **OAuth robusto** en `core/gmail/auth.py`: scopes desde config, refresh y `token.json` autogenerado.
- **Docs**: README actualizado (MVP + H4), `.env.example` minimal, QA manual y Checklist fase 3.

### Changed
- `utils/config.py`: carga `config.json` + validaciones tipadas; ENV legacy solo como fallback.
- `core/gmail/leer.py` y `core/gmail/buscar.py`: adoptan retry, paginación, `fields` mínimos y filtrado de headers.

### Fixed
- Evita llamadas reales en modo **fake** (passthrough en retry; abstracción de `core.gmail`).
- Manejo de errores 401/403 (no rate): mensaje claro y log; 429/5xx con reintentos.

### Security
- No se loggean cuerpos de emails ni datos sensibles; solo métricas y conteos.

### Docs
- `README.md` con instrucciones de configuración, fake/real y ejemplos.
- `QA_Manual_Fase3.md` y `Checklist_Fase_3_Integracion_Gmail_Real.md` añadidos.

### Compatibility
- **Breaking changes**: **Ninguno**. Contratos de intents se mantienen. En fake, comportamiento intacto.

---

## [v0.1.0] - 2025-08-01
### Added
- MVP inicial: lectura fake/real, intents básicos (remitentes_hoy, contar_no_leidos, leer_ultimo, resumen_hoy), API `/api/comando`.
