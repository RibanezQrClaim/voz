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

## Desarrollo

```bash
npm run -w apps/main-ui dev
```

## Estados de depuración

Agrega `?state=empty` o `?state=loading` al URL para forzar estados.

- `?state=empty` renderiza un placeholder con `role="status"`.
- `?state=loading` muestra skeletons con glass y `aria-busy="true"`.

Revisar copy claro, contraste y que la navegación con tab mantenga foco visible en botones e inputs.

