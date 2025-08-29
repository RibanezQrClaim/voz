# 📖 Guía UX/UI NexusG — Base + Extensiones (Versión Autosuficiente)

Este documento reúne la **visión completa y estable** de UX/UI para NexusG.  
Es la **fuente de verdad** que contiene:  
- Principios fundamentales y obra gruesa (Guía Extendida).  
- Representación visual jerárquica (Mapa).  
- Funcionalidades aspiracionales de clase mundial (Premium).  
- Validación y análisis crítico desde perspectiva senior.  

---

# 📐 Parte 1 — Guía UX/UI Base Completa (Extendida + Mapa)

## Principios Fundamentales
- **Simplicidad ante todo**: cada pantalla y flujo reduce carga cognitiva.  
- **Transparencia al usuario**: nunca se muestra qué agente responde; todo aparece como una sola entidad cohesiva.  
- **Sin fondos negros**: se adopta un estilo claro futurista (grises, celestes, plateados).  
- **Explicabilidad**: burbujas “¿Por qué?” explican decisiones de la IA.  
- **Personalización visible**: uso del nombre del usuario, rituales diarios.  

## Pantallas Principales
1. **Pantalla Principal de Chat**
   - Input texto/voz.
   - Burbujas diferenciadas (usuario/asistente).
   - Chips de acciones rápidas (máx. 3–4).
   - Botón Stop Audio flotante.
2. **Sidebar Izquierda**
   - Categorías de conversación (HOY, CLIENTES, URGENTES, TAREAS).  
   - Sección Documentos (Docs, Tablas, PDFs, Imágenes).  
   - Acceso a Configuración, Memoria, Contexto.  
3. **Centro de Control (Admin/Config)**
   - Salud del sistema.  
   - Configuración avanzada.  

## Tokens Visuales
- Colores: gama clara futurista (gris suave, celeste, plateado).  
- Tipografías: **Inter** (cuerpo), **IBM Plex Sans** (titulares).  
- Formas: glassmorphism (efecto vidrio translúcido), esquinas redondeadas XL.  
- Transiciones: suaves, con microinteracciones al accionar chips/botones.  

## Estados
- **Empty**: no hay correos → pantalla clara, calmada.  
- **Loading**: skeletons.  
- **Error**: mensajes amables + banner.  
- **Degradado**: aviso cuando se reduce detalle por alta carga.  
- **Offline**: mensaje claro y opción de reconectar.  

## Mapa Visual (Esquema Jerárquico)
```
Chat Principal
 ├── Input (texto/voz)
 ├── Burbujas (usuario/asistente)
 ├── Chips de acción rápida
 └── Stop Audio
Sidebar
 ├── Categorías (Hoy, Urgentes, Clientes, Tareas)
 ├── Documentos (Docs, Tablas, PDFs, Imágenes)
 └── Configuración/Memoria/Contexto
Centro de Control
 ├── Salud del sistema
 └── Configuración avanzada
```

---

# ✨ Parte 2 — Funcionalidades Premium

Inspiradas en benchmarks clase mundial (Slack, Notion, Linear, Coda, Miro).  

## Sidebar de Documentos
- Subcategorías: Docs/Textos, Tablas, Imágenes, PDFs.  
- Vista previa embebida.  
- Descripciones automáticas (tooltip).  
- Hashtags en todos los documentos.  

## Búsqueda Universal
- Campo único (Ctrl/Cmd+K o voz).  
- Busca en: conversaciones, documentos, hashtags, personas.  

## Relación Documento ↔ Conversación
- Cada documento enlaza a su conversación de origen.  
- Desde la conversación → chip “Ver en Documentos”.  

## Previews Vivos
- Tablas navegables, PDFs/Imágenes con visor integrado.  

## Comando Universal
- Barra tipo Linear (Cmd+K).  
- Salto rápido a docs, conversaciones, acciones.  

## Notificaciones Inteligentes
- Solo urgentes, recordatorios y nuevos documentos relevantes.  

## Colaboración
- Comentarios inline en documentos.  
- Asociación de pendientes/tareas a cualquier documento.  

---

# 🔍 Parte 3 — Análisis Crítico Senior

## Consistencia y Coherencia Estratégica
- **Transparencia** y respuestas unificadas → refuerza la idea de un solo asistente.  
- **Simplicidad visual** (sin fondos negros) → transmite calma en un entorno de caos.  
- **Onboarding inmediato** → evita la fricción mortal de QrClaim.  
- **Explicabilidad** (¿Por qué?) → construye confianza en la IA.  

## Guía de Mejoras (de Senior a Clase Mundial)
1. **Flujo de la Primera Victoria**  
   - Banner y propuesta proactiva post-onboarding.  
   - Evita página en blanco → recompensa inmediata.  
2. **Rituales de Interacción**  
   - *Briefing de la Mañana*: resumen proactivo.  
   - *Cierre del Día*: pendientes o desconexión.  
   - Crea hábito y relación emocional.  
3. **Evolución Acciones Rápidas**  
   - V1: genéricas (Responder, Archivar, Agendar).  
   - V2: contextuales (Agendar con Logística).  
   - Visión a largo plazo: el botón correcto en el momento correcto.  

## Conclusión
El plan base es sólido, coherente con la estrategia de negocio y enfocado en el usuario.  
Con las mejoras propuestas, NexusG pasa de una buena interfaz a una **relación simbiótica** entre gerente y asistente.  

---

# 📌 Notas Finales
Este archivo constituye la **base estable**:  
- No cambia sprint a sprint.  
- Define la visión integral del producto.  
- Guía tanto a diseño como a negocio.  

Para ejecución táctica y procesos ágiles se utilizan los otros documentos: Roadmap+Ejecución y Metodología.
