# 📁 Carpeta `figma/` --- Fuente de Verdad Visual

Este directorio contiene los **exports originales de Figma** usados como
base visual para NexusG.\
Se organizan en dos subcarpetas (una por cada ZIP exportado):

    figma/
    ├─ style-guide/       # tokens, botones, chips, burbujas
    └─ main-ui/           # layout y pantalla principal (chat)

------------------------------------------------------------------------

## 1. `style-guide/`

Proviene de: **Style Guide Page (copia).zip**\
Contiene los elementos base del sistema de diseño: - `tokens.json` →
colores, radios, spacing, sombras, tipografías. - `styles.css` →
definiciones globales (reset, tipografías). - `components/` → ejemplos
de botones, chips, burbujas.

👉 **Uso esperado**: - Mapear `tokens.json` →
`packages/ui/src/tokens.ts` y variables CSS en `:root`. - Integrar
`styles.css` en `packages/ui/dist/styles.css` (@layer base). - Tomar
`components/` como referencia para implementar `NxButton`, `NxChip`,
`NxUserBubble`, `NxAssistantBubble`.

------------------------------------------------------------------------

## 2. `main-ui/`

Proviene de: **Nexus G Ux_Uy Base.zip**\
Contiene la maqueta de la pantalla principal: - `layout/` → estructura
de grillas y sidebar. - `pages/` → página principal del chat. -
`components/` → instancias visuales de burbujas, chips, botones. -
`assets/` → íconos, SVGs (si aplica).

👉 **Uso esperado**: - Servir como referencia visual para `apps/main-ui`
(shell de chat). - Sidebar estática, área de chat y barra inferior deben
replicar este look.

------------------------------------------------------------------------

## 3. Flujo de trabajo

1.  **No editar directamente** estos archivos: son referencia de
    diseño.\
2.  Todo lo productivo se construye en:
    -   `packages/ui` → librería de componentes reutilizables.
    -   `apps/main-ui` → aplicación shell que consume el UI Kit.\
3.  Cuando haya un nuevo export de Figma:
    -   Reemplazar contenido de la subcarpeta correspondiente.
    -   Actualizar `tokens.ts` y componentes si hay cambios.

------------------------------------------------------------------------

📌 **Nota**:\
Esta carpeta es solo *fuente de verdad visual*. El código productivo y
tipado vive en `packages/ui` y `apps/main-ui`.
