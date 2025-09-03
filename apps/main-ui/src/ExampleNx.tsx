import { NxButton, NxChip, NxUserBubble, NxAssistantBubble } from '@nexusg/ui';

export default function ExampleNx() {
  return (
    <div className="space-y-4 p-4">
      <NxButton>Enviar</NxButton>
      <NxChip>Etiqueta</NxChip>
      <NxUserBubble ariaLabel="mensaje de usuario">Hola</NxUserBubble>
      <NxAssistantBubble ariaLabel="mensaje del asistente">Â¿En quÃ© puedo ayudarte?</NxAssistantBubble>
    </div>
  );
}



