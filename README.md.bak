# Voz Agente Gmail

## Instalación

Instala las dependencias básicas:

```bash
pip install -r requirements.txt
```

### Extras opcionales

Para funciones de lenguaje y audio hay archivos de requisitos separados. Instálalos sólo si los necesitas:

```bash
pip install -r requirements-llm.txt  # modelo de lenguaje
pip install -r requirements-audio.txt  # entrada/salida de voz
```

Estas dependencias no son necesarias para ejecutar las pruebas en modo falso (`USE_FAKE_GMAIL=1`).

### Modo fake offline

Para trabajar sin acceso a Gmail real, define:

```bash
export USE_FAKE_GMAIL=1
export FAKE_EMAILS_PATH=tests/fixtures/emails_home.json  # opcional
# Alias aceptado: FAKE_EMAILS_FILE
```

Los tests usan este modo y funcionan sin instalar los extras de LLM o audio.

Los helpers de Gmail (`listar`, `leer_ultimo`, `remitentes_hoy`, `contar_no_leidos`,
`buscar` y `resumen_correos_hoy`) ya no aceptan el objeto `service`; lo obtienen
internamente. Cualquier argumento inesperado se ignora y se registra un *warning*.

### Nota sobre proxies

Algunos entornos corporativos bloquean descargas de `pip` (por ejemplo `jsonschema`).
Si una instalación falla por proxy, puedes ignorarla: las pruebas no dependen de ese paquete.

### Benchmark local

Para medir la latencia de las operaciones básicas de Gmail ejecuta:

```bash
USE_FAKE_GMAIL=1 FAKE_EMAILS_PATH=tests/fixtures/emails_home.json python tools/benchmark_local.py
```

Si cuentas con credenciales reales, repite con `USE_FAKE_GMAIL=0`.
El script mostrará percentiles P50 y P95 para cada operación.

### Smoke Real pendiente

Para ejecutar el smoke con Gmail real se requiere un archivo `token.json` generado vía OAuth.
Si no cuentas con él, el benchmark real no se ejecutará.
