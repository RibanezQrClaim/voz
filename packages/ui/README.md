# @nexusg/ui

UI kit con tokens y componentes básicos extraídos de Figma.

## Uso

1. **Estilos globales**

```ts
import '@nexusg/ui/dist/styles.css';
```

2. **Preset de Tailwind**

```js
// tailwind.config.cjs
module.exports = {
  presets: [require('@nexusg/ui/tailwind-preset.cjs')],
};
```

3. **Componentes**

```tsx
import { NxButton, NxChip, NxUserBubble, NxAssistantBubble } from '@nexusg/ui';

export function Example() {
  return (
    <div className="space-y-4">
      <NxButton>Enviar</NxButton>
      <NxChip>Etiqueta</NxChip>
      <NxUserBubble ariaLabel="mensaje de usuario">Hola</NxUserBubble>
      <NxAssistantBubble ariaLabel="mensaje del asistente">¿En qué puedo ayudarte?</NxAssistantBubble>
    </div>
  );
}
```
