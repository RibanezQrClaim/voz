# Main UI

Aplicación que consume el kit `@nexusg/ui`.

## Uso del kit

1. Importa los estilos del kit en `src/index.css` antes de las directivas de Tailwind:

```css
/* src/index.css */
@import '@nexusg/ui/dist/styles.css';
@tailwind base;
@tailwind components;
@tailwind utilities;
```

2. `tailwind.config.cjs` debe usar el preset y escanear también el paquete para que se generen las clases del kit:

```js
// tailwind.config.cjs
const nxPreset = require('@nexusg/ui/tailwind-preset.cjs');

module.exports = {
  presets: [nxPreset],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    './node_modules/@nexusg/ui/**/*.{js,jsx,ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
    '../../packages/ui/dist/**/*.{js,jsx}',
  ],
};
```

## Fuentes

Las tipografías **Inter** e **IBM Plex Sans** se descargan desde Google Fonts mediante las etiquetas añadidas en `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=IBM+Plex+Sans:wght@400;600&display=swap" rel="stylesheet">
```

<!-- Ejemplo para alojar las fuentes localmente:
<link rel="stylesheet" href="/fonts/inter.css">
<link rel="stylesheet" href="/fonts/ibm-plex-sans.css">
-->

## Desarrollo

```bash
npm run -w apps/main-ui dev
```

## Estados de depuración

Agrega `?state=empty`, `?state=loading`, `?state=error` o `?state=offline` al URL para forzar estados.

- `?state=empty` renderiza un placeholder con `role="status"`.
- `?state=loading` muestra skeletons con glass y `aria-busy="true"`.
- `?state=error` muestra un banner de error con botón **Reintentar**.
- `?state=offline` fuerza el aviso de sin conexión.

Para simular offline en el navegador usa DevTools → pestaña Network y selecciona **Offline**.

Revisar copy claro, contraste y que la navegación con tab mantenga foco visible en botones e inputs.

