# Main UI

Aplicación que consume el kit `@nexusg/ui`.

## Uso del kit

1. Importa los estilos en `src/main.tsx`:

```ts
import '@nexusg/ui/dist/styles.css';
import './index.css';
```

2. Tailwind utiliza el preset del paquete:

```js
// tailwind.config.cjs
module.exports = {
  presets: [require('@nexusg/ui/tailwind-preset.cjs')],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
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

Agrega `?state=empty` o `?state=loading` al URL para forzar estados.

- `?state=empty` renderiza un placeholder con `role="status"`.
- `?state=loading` muestra skeletons con glass y `aria-busy="true"`.

Revisar copy claro, contraste y que la navegación con tab mantenga foco visible en botones e inputs.

