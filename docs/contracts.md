# contracts.md — v1 (SOT: Fuente Única de Verdad)

> Mandamientos: simple • modular • limpio • escalable.  
> Uso: la UI y los servicios consumen estos contratos; no se redefinen.

## 0) Versionado y nombres
- `version`: "v1"
- Namespaces de persistencia local:  
  - `nexusg.v1.personalization`, `nexusg.v1.ui`, `nexusg.v1.memory`

---

## 1) Personalización (Wizard de 5 pasos)

### AgentProfile
- `id`: uuid
- `name`: string  // “Laura”
- `voice`: enum("a","b","c") // opciones placeholder; se mapearán a voces definidas en el design system
- `createdAt`: iso8601
- `updatedAt`: iso8601

### UserContext
- `role`: string            // cargo/rol
- `priorities`: string[3]   // exactamente 3
- `timezone`: IANA          // ej. "America/Santiago" (validado contra config)
- `primaryEmail`: email     // lectura inicial desde config

### TrustCircleItem
- `alias`: string  // “Finanzas”
- `email`: email
- `tags`: string[] // opcional

### UrgencyRule
- `id`: uuid
- `from`: string   // email | alias | "*" 
- `contains`: string[] // ≥1 palabra clave
- `level`: enum("urgent","important","normal")
- `active`: boolean

### PersonalizationState
- `agentProfile`: AgentProfile
- `user`: UserContext
- `trustCircle`: TrustCircleItem[]
- `rules`: UrgencyRule[]
- `isComplete`: boolean  // gating Wizard→Main

---

## 2) Comunicación (Gmail / Calendar)

### EmailHeader (mínimo)
- `id`: string
- `threadId`: string
- `from`: string
- `subject`: string
- `internalDate`: int(ms epoch)
- `labels`: string[]

### EmailSummary
- `id`: string
- `from`: string
- `subject`: string
- `snippet`: string       // limpio (sin disclaimers/firmas)
- `summary280`: string    // ≤280 chars, incluir remitente+asunto+extracto
- `why`: string           // “marcado urgente porque…”

### EventCard (mínimo)
- `id`: string
- `title`: string
- `start`: iso8601
- `end`: iso8601
- `participants`: { name?: string, email: string }[]
- `reason`: string  // vínculo con regla/círculo

---

## 3) UI (presentación y listas)

### Card
- `type`: enum("email","event","info","error")
- `data`: EmailSummary | EventCard | any
- `actions`: enum("Resumen","Urgente","Agendar","Abrir")[] // set limitado de acciones rápidas
- `meta`: { createdAt: iso8601, source: "gmail"|"calendar"|"system" }

### UIState
- `view`: enum("onboarding","main")
- `list`: Card[]
- `listFilter`: enum("all","urgent","today")
- `listSort`: enum("recency","importance")

---

## 4) Telemetría (Fase 4 compatible)

### TelemetryEntry
- `ts`: iso8601
- `action`: enum("remitentes_hoy","resumen_hoy","leer_ultimo","buscar_correo")
- `backend`: enum("fake","real")
- `durationMs`: number
- `retriesByCode`: { [httpCode]: number }
- `sleptMsTotal`: number
- `ok`: boolean
- `error?`: string

---

## 5) Memoria/Aprendizaje (sugerencias, no muta contratos)

### Observation
- `ts`: iso8601
- `source`: "gmail"|"ui"|"calendar"
- `pattern`: string   // frase o heurística detectada
- `sample`: any       // evidencia minimal (IDs, no contenido sensible)

### Insight
- `patternId`: string
- `score`: number [0..1]
- `evidence`: string[] // ids de Observation

### RuleProposal
- `id`: uuid
- `fromPatternId`: string
- `draft`: UrgencyRule
- `status`: enum("proposed","approved","rejected","applied") // se agregó "applied"

---

## 6) Reglas de validación (mínimas)
- `priorities.length === 3` y strings no vacíos.
- `TrustCircleItem.email` válido; `alias` único dentro del círculo.
- `UrgencyRule.contains.length ≥ 1`.
- `EmailSummary.summary280.length ≤ 280`.
- `UserContext.timezone` IANA y coherente con `config`.
- `primaryEmail` válido (preferente desde config).

---

## 7) Adaptadores de persistencia (interfaz)
- `MemoryAdapter`: `get(ns,key) -> any | null`, `set(ns,key,value)`, `remove(ns,key)`
- Implementaciones: `inMemory`, `localStor
