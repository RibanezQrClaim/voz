# Wizard Layout — Onboarding + Main

> Basado en `contracts.md` (v1) y alineado a la promesa de onboarding <15 min.  
> Mandamientos: simple • modular • limpio • escalable.

---

## 0) AppShell (común)
- **Header**: Logo | Paso actual | Help?
- **Progress**: barra 5 segmentos con labels: *Agente, Voz, Rol & Prioridades, Círculo, Reglas*
- **Body**: contenedor centrado (máx 720px).
- **Footer**: Atrás | Continuar (primario) | Guardar y salir

**Estados globales**
- `loading` (al leer persistencia)
- `toast` de éxito/fracaso
- `dirty` → confirmar al salir del paso

---

## Paso 1 — Nombre del Agente
- **UI**: Input “¿Cómo se llamará tu agente?” (placeholder: “Laura”)
- **Contrato**: `agentProfile.name`
- **Validación**: requerido, ≤40 chars
- **Telemetría**: `wizard_agent_name.submit`

---

## Paso 2 — Voz
- **UI**: selector con 3 opciones (A/B/C) + botón `Pre-escuchar`
- **Contrato**: `agentProfile.voice`
- **Validación**: opción seleccionada
- **Telemetría**: `wizard_voice.preview|submit`

---

## Paso 3 — Rol & 3 Prioridades
- **UI**: 
  - Rol (input corto)
  - Prioridades (3 chips editables con placeholders)
  - Readonly: `primaryEmail`, `timezone` (desde config)
- **Contrato**: `user.role`, `user.priorities[3]`, `user.timezone`, `user.primaryEmail`
- **Validación**: 3 prioridades no vacías
- **Telemetría**: `wizard_role_priorities.submit`

---

## Paso 4 — Círculo de Confianza
- **UI**: tabla editable
  - columnas: Alias, Email, Tags, Acciones
  - acciones: Agregar / Editar / Eliminar
- **Contrato**: `trustCircle: TrustCircleItem[]`
- **Validación**: email válido; alias único
- **Telemetría**: `wizard_trustcircle.add|edit|remove|submit`

---

## Paso 5 — Reglas de Urgencia
- **UI**: constructor por fila
  - From: email | alias | *
  - Contains: chips (≥1)
  - Level: urgent | important | normal
  - Active: toggle
- **Contrato**: `rules: UrgencyRule[]`
- **Validación**: `contains.length ≥ 1`
- **Explicabilidad**: se explica que aparecerá en `EmailSummary.why`
- **Telemetría**: `wizard_rules.add|test|submit`

---

## Confirmación
- **Resumen**: nombre + voz + rol + 3 prioridades + N contactos + N reglas
- **Acción**: Confirmar → `isComplete=true` y navegar a Main
- **Telemetría**: `wizard_confirm.complete`

---

## Gating & Persistencia
- **Condición**: si `isComplete=false` → mostrar Wizard
- **Guardado por paso**: al `Continuar` → persistir `PersonalizationState` completo
- **Reanudación**: recordar `lastStep` y saltar ahí
- **Cancelar**: `Guardar y salir` mantiene avances, vuelve al landing

---

## Main (post-wizard)
- **Header**: Logo | Buscar | Acciones rápidas (¿Quién me escribió hoy?, Resumen hoy)
- **Body**: CardsList (emails/eventos)
- **Sidebar**: Filtros (all/urgent/today) + Sugerencias (memoria)

**Card (email)**
- Top: remitente + etiqueta
- Title: asunto
- Snippet: extracto
- Footer: acciones (Resumen, Abrir, Agendar, Marcar urgente)
- Transparencia: tooltip con `why`

---

## Responsivo & Accesibilidad
- Grid 12 col, contenedor 720px (desktop), padding 16px (mobile)
- Mobile: progress sticky top, botones sticky bottom
- A11y: tab-order correcto, labels, `Enter` envía si válido, `Esc` cierra modales

---

## Microcopy
- Errores: “Requerido”, “Alias ya existe”, “Email inválido”
- Guardado: “Cambios guardados”
- Reglas: “Se marcará como *Urgente* cuando…”

---

## IDs QA/telemetría
- `#wiz-step-1-name`
- `#wiz-step-2-voice`
- `#wiz-step-3-role`
- `#wiz-step-4-trust`
- `#wiz-step-5-rules`
- Botones: `#btn-back`, `#btn-next`, `#btn-save-exit`, `#btn-confirm`

---

## Criterios de aceptación
- Completar en < 15 min
- Reanuda wizard en último paso tras reload
- Confirmar → `isComplete=true` y Main
- Crear regla (`*`, “urgente”) → visible en `why`
