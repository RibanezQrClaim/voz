# 🚀 Roadmap + Ejecución UX/UI — NexusG (Versión Autosuficiente)

Este documento reúne la **planificación práctica y táctica** de UX/UI para NexusG.  
Contiene:  
- Roadmap UX/UI por fases.  
- Informe para cubrir el gap hasta Fase 4.  
- Checklist de frames Figma necesarios hasta Fase 4.  

---

# 📍 Parte 1 — Roadmap UX/UI

## Fase 1 — Fundación (MVP Fase 1)
- **Objetivo**: habilitar lo mínimo usable, coherente con comandos base.
- **Entregables UX/UI**:
  - Pantalla principal de chat con input (texto/voz).
  - Burbujas diferenciadas (usuario vs asistente).
  - Chips básicos (ej. “URGENTE”, “HOY”).
  - Barra inferior con Stop Audio.
- **Validación**: pruebas internas con fake Gmail.

## Fase 2 — Valor inicial (MVP Fase 2)
- **Objetivo**: mostrar al usuario que el sistema ya le da valor.
- **Entregables UX/UI**:
  - Tarjetas de resumen de correos (≤ 280 chars).
  - Alertas básicas en UI cuando detecta “urgente”.
  - Estado “vacío” cuando no hay correos.
  - Skeleton loading en consultas.
  - Banner “Primera Victoria” con CTA.
- **Validación**: flujo “Primera Victoria” → el sistema ofrece un resumen proactivo post-onboarding.

## Fase 3 — Pulido y Personalización (MVP Fase 3)
- **Objetivo**: mejorar experiencia percibida.
- **Entregables UX/UI**:
  - Uso de nombre del usuario en respuestas.
  - Sincronización voz ↔ UI (cuando habla, animación pulso Stop Audio).
  - Rituales básicos (Briefing mañana, Cierre del día).
  - Estilo visual consolidado (paleta futurista clara + tipografías).
- **Validación**: tests con usuarios internos → ¿genera confianza y engagement?

## Fase 4 — Producción y Escalabilidad (alineado Fase 4 Plan técnico)
- **Objetivo**: que la UI soporte estados de resiliencia.
- **Entregables UX/UI**:
  - Estados globales (offline, degradado, error amable).
  - Panel de salud/conexión simple.
  - Logs y métricas visibles en modo admin (opcional).
- **Validación**: QA manual con escenarios de falla.

## Fase 5 — Documentos y Organización (post-MVP, Funcionalidades Premium)
- **Objetivo**: convertir al asistente en un hub de outputs.
- **Entregables UX/UI**:
  - Sidebar Documentos con subcategorías (Docs, Tablas, PDFs, Imágenes).
  - Previews vivos (drawer/modal).
  - Tooltips con descripción y hashtags.
  - Recuperación desde chat (“Muéstrame la tabla de costos de la semana pasada”).
- **Validación**: demos a stakeholders → valor agregado percibido.

## Fase 6 — Funcionalidades Clase Mundial
- **Objetivo**: hacer el producto adictivo.
- **Entregables UX/UI**:
  - Búsqueda universal (Ctrl/Cmd+K).
  - Comando rápido (acciones contextuales).
  - Notificaciones inteligentes (solo urgentes).
  - Comentarios inline en outputs.
  - Asociación de pendientes a documentos.
- **Validación**: pilotos con clientes → adopción diaria.

---

# 📐 Parte 2 — Informe: Cubrir Gap Fase 4

**Objetivo**  
Completar de una sola vez el diseño UX/UI correspondiente a las Fases 1–4 del Roadmap NexusG, dado que el desarrollo técnico ya alcanzó Fase 4.  
A partir de Fase 5 se trabajará con metodología de *pitches* acotados.

## Fase 1 — Fundación
- Consolidar en Figma los componentes base: `Bubble`, `Chip`, `Input`, `Stop Audio`.

## Fase 2 — Valor inicial
- Frames con estados: `Empty`, `Loading`, `Urgentes`, `Primera Victoria`.

## Fase 3 — Pulido y Personalización
- Variantes de chat con mensajes tipo ritual.
- Tokens visuales de paleta y tipografía.

## Fase 4 — Producción y Escalabilidad
- Frames en Figma: `Error`, `Offline`, `Degradado`, `Modo Admin`.

**Estrategia práctica**
1. En Figma: archivo **“UX/UI hasta Fase 4”**.  
2. Agrupar por fase, un frame por estado/pantalla relevante.  
3. Usar kits gratuitos ya definidos (Glassmorphism UI, Lucide, Dashboard Kit).  
4. Validar que cada punto del roadmap hasta Fase 4 tenga al menos un frame representativo.

---

# ✅ Parte 3 — Checklist Figma Fase 4

## Fase 1 — Fundación
- [ ] Frame: Pantalla principal Chat (vacía)
- [ ] Componente: Bubble/Usuario
- [ ] Componente: Bubble/Asistente
- [ ] Componente: Chip Básico (“URGENTE”, “HOY”)
- [ ] Componente: Input Texto/Voz (con micrófono)
- [ ] Componente: Botón Stop Audio

## Fase 2 — Valor inicial
- [ ] Frame: Estado Empty (sin correos)
- [ ] Frame: Estado Loading (skeleton)
- [ ] Frame: Chat con Tarjeta Resumen (≤280 chars)
- [ ] Frame: Chat con Alerta Urgente (badge)
- [ ] Frame: Banner Primera Victoria (con CTA)

## Fase 3 — Pulido y Personalización
- [ ] Frame: Chat con saludo personalizado (“Hola Rodrigo…”)
- [ ] Frame: Animación Stop Audio (pulso activo)
- [ ] Frame: Ritual Briefing de la Mañana
- [ ] Frame: Ritual Cierre del Día
- [ ] Tokens visuales (paleta y tipografía)

## Fase 4 — Producción y Escalabilidad
- [ ] Frame: Estado Offline
- [ ] Frame: Estado Error (banner amable)
- [ ] Frame: Estado Degradado
- [ ] Frame: Panel Salud/Conexión (modo admin)
- [ ] Frame: Logs/Métricas (modo admin)

---

# 📌 Notas Finales
Este archivo es de **uso operativo**.  
Se actualiza en cada iteración, pero siempre respetando la visión base definida en el documento maestro.
