import { useState } from 'react';
import { ColorSwatch } from './components/ColorSwatch';
import { TypographyExample } from './components/TypographyExample';
import { StyleGuideNavigation } from './components/StyleGuideNavigation';
import { DesignTokens } from './components/DesignTokens';
import { 
  PrimaryButton, 
  SecondaryButton, 
  UrgentChip, 
  UserBubble, 
  AssistantBubble 
} from './components/StyleGuideComponents';

export default function App() {
  const [activeSection, setActiveSection] = useState('colors');

  const colors = [
    { color: '#F3F4F6', label: 'Gray 100', usage: 'Fondos secundarios' },
    { color: 'rgba(255,255,255,0.7)', label: 'White 70%', usage: 'Overlay translúcido' },
    { color: '#0EA5E9', label: 'Sky 500', usage: 'Color primario' },
    { color: '#1E3A8A', label: 'Blue 900', usage: 'Texto principal' },
    { color: '#E2E8F0', label: 'Slate 200', usage: 'Bordes suaves' },
    { color: '#94A3B8', label: 'Slate 400', usage: 'Texto secundario' },
    { color: '#10B981', label: 'Emerald 500', usage: 'Estados exitosos' },
    { color: '#F59E0B', label: 'Amber 500', usage: 'Advertencias' },
    { color: '#EF4444', label: 'Red 500', usage: 'Errores y urgencia' },
    { color: '#1E293B', label: 'Slate 800', usage: 'Texto principal' },
    { color: '#475569', label: 'Slate 600', usage: 'Texto secundario' }
  ];

  const spacingTokens = [
    { name: 'xs', value: '4px', description: 'Espacio extra pequeño' },
    { name: 'sm', value: '8px', description: 'Espacio pequeño' },
    { name: 'md', value: '16px', description: 'Espacio medio' },
    { name: 'lg', value: '24px', description: 'Espacio grande' },
    { name: 'xl', value: '32px', description: 'Espacio extra grande' },
    { name: '2xl', value: '48px', description: 'Espacio 2x grande' }
  ];

  const borderRadiusTokens = [
    { name: 'sm', value: '4px', description: 'Radio pequeño' },
    { name: 'md', value: '8px', description: 'Radio medio' },
    { name: 'lg', value: '12px', description: 'Radio grande' },
    { name: 'xl', value: '16px', description: 'Radio extra grande' },
    { name: '2xl', value: '24px', description: 'Radio 2x grande' }
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Navigation Sidebar */}
      <StyleGuideNavigation 
        activeSection={activeSection} 
        onSectionChange={scrollToSection} 
      />

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-8 py-8">
            <h1 
              className="text-gray-900"
              style={{ 
                fontFamily: '"IBM Plex Sans", sans-serif', 
                fontSize: '32px', 
                fontWeight: '600' 
              }}
            >
              Design System Guide
            </h1>
            <p 
              className="mt-2 text-gray-600"
              style={{ fontFamily: 'Inter', fontSize: '16px' }}
            >
              Guía completa de componentes, tokens y patrones de diseño
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-8 py-8 space-y-16">
          {/* Paleta de Colores */}
          <section id="colors">
            <h2 
              className="mb-8 text-gray-900"
              style={{ 
                fontFamily: '"IBM Plex Sans", sans-serif', 
                fontSize: '24px', 
                fontWeight: '600' 
              }}
            >
              🎨 Paleta de Colores
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 
                  className="mb-4 text-gray-700"
                  style={{ 
                    fontFamily: '"IBM Plex Sans", sans-serif', 
                    fontSize: '18px', 
                    fontWeight: '500' 
                  }}
                >
                  Colores Principales
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {colors.slice(0, 6).map((colorItem, index) => (
                    <ColorSwatch
                      key={index}
                      color={colorItem.color}
                      label={colorItem.label}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <h3 
                  className="mb-4 text-gray-700"
                  style={{ 
                    fontFamily: '"IBM Plex Sans", sans-serif', 
                    fontSize: '18px', 
                    fontWeight: '500' 
                  }}
                >
                  Colores Semánticos
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {colors.slice(6).map((colorItem, index) => (
                    <ColorSwatch
                      key={index + 6}
                      color={colorItem.color}
                      label={colorItem.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DesignTokens
                title="Espaciado"
                tokens={spacingTokens.map(token => ({
                  ...token,
                  preview: <div className="w-4 h-1 bg-blue-500" style={{ width: token.value }} />
                }))}
              />
              <DesignTokens
                title="Border Radius"
                tokens={borderRadiusTokens.map(token => ({
                  ...token,
                  preview: <div className="w-4 h-4 bg-blue-500" style={{ borderRadius: token.value }} />
                }))}
              />
            </div>
          </section>

          {/* Tipografías */}
          <section id="typography">
            <h2 
              className="mb-8 text-gray-900"
              style={{ 
                fontFamily: '"IBM Plex Sans", sans-serif', 
                fontSize: '24px', 
                fontWeight: '600' 
              }}
            >
              📝 Sistema Tipográfico
            </h2>
            
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 
                    className="mb-6 text-gray-700"
                    style={{ 
                      fontFamily: '"IBM Plex Sans", sans-serif', 
                      fontSize: '18px', 
                      fontWeight: '500' 
                    }}
                  >
                    Jerarquía Tipográfica
                  </h3>
                  <TypographyExample
                    text="Título Principal H1"
                    description="IBM Plex Sans 32px semibold"
                    fontSize="32px"
                    fontWeight="600"
                    fontFamily='"IBM Plex Sans", sans-serif'
                  />
                  <TypographyExample
                    text="Título Secundario H2"
                    description="IBM Plex Sans 24px medium"
                    fontSize="24px"
                    fontWeight="500"
                    fontFamily='"IBM Plex Sans", sans-serif'
                  />
                  <TypographyExample
                    text="Subtítulo H3"
                    description="IBM Plex Sans 18px medium"
                    fontSize="18px"
                    fontWeight="500"
                    fontFamily='"IBM Plex Sans", sans-serif'
                  />
                </div>
                
                <div>
                  <h3 
                    className="mb-6 text-gray-700"
                    style={{ 
                      fontFamily: '"IBM Plex Sans", sans-serif', 
                      fontSize: '18px', 
                      fontWeight: '500' 
                    }}
                  >
                    Texto de Contenido
                  </h3>
                  <TypographyExample
                    text="Texto de cuerpo para párrafos y contenido principal. Esta es la tipografía base que se usa en la mayoría del contenido."
                    description="Inter 16px regular"
                    fontSize="16px"
                    fontWeight="400"
                    fontFamily='Inter, sans-serif'
                  />
                  <TypographyExample
                    text="Texto pequeño para etiquetas, metadatos y contenido secundario."
                    description="Inter 14px regular"
                    fontSize="14px"
                    fontWeight="400"
                    fontFamily='Inter, sans-serif'
                  />
                  <TypographyExample
                    text="Texto de capción muy pequeño."
                    description="Inter 12px regular"
                    fontSize="12px"
                    fontWeight="400"
                    fontFamily='Inter, sans-serif'
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Componentes Base */}
          <section id="components">
            <h2 
              className="mb-8 text-gray-900"
              style={{ 
                fontFamily: '"IBM Plex Sans", sans-serif', 
                fontSize: '24px', 
                fontWeight: '600' 
              }}
            >
              🧩 Biblioteca de Componentes
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Botones */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 
                  className="mb-6 text-gray-700"
                  style={{ 
                    fontFamily: '"IBM Plex Sans", sans-serif', 
                    fontSize: '18px', 
                    fontWeight: '500' 
                  }}
                >
                  Botones
                </h3>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <PrimaryButton>Botón Primario</PrimaryButton>
                    <div className="text-xs text-gray-500 font-mono">
                      bg-[#0EA5E9] • Acciones principales
                    </div>
                  </div>
                  <div className="space-y-3">
                    <SecondaryButton>Botón Secundario</SecondaryButton>
                    <div className="text-xs text-gray-500 font-mono">
                      bg-[#E2E8F0] • Acciones secundarias
                    </div>
                  </div>
                </div>
              </div>

              {/* Estados y Chips */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 
                  className="mb-6 text-gray-700"
                  style={{ 
                    fontFamily: '"IBM Plex Sans", sans-serif', 
                    fontSize: '18px', 
                    fontWeight: '500' 
                  }}
                >
                  Estados y Etiquetas
                </h3>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <UrgentChip />
                    <div className="text-xs text-gray-500 font-mono">
                      bg-[#EF4444] • Estado de urgencia
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#10B981] text-white">
                      COMPLETADO
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#F59E0B] text-white">
                      PENDIENTE
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#94A3B8] text-white">
                      INACTIVO
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Burbujas de Chat */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mt-6">
              <h3 
                className="mb-6 text-gray-700"
                style={{ 
                  fontFamily: '"IBM Plex Sans", sans-serif', 
                  fontSize: '18px', 
                  fontWeight: '500' 
                }}
              >
                Componentes de Conversación
              </h3>
              <div className="space-y-6 max-w-lg">
                <div className="space-y-2">
                  <UserBubble>
                    Mensaje del usuario con estilo alineado a la derecha
                  </UserBubble>
                  <div className="text-xs text-gray-500 text-right font-mono">
                    bg-[#F3F4F6] • Mensaje del usuario
                  </div>
                </div>
                <div className="space-y-2">
                  <AssistantBubble>
                    Respuesta del asistente con efecto de vidrio translúcido
                  </AssistantBubble>
                  <div className="text-xs text-gray-500 font-mono">
                    rgba(255,255,255,0.7) • backdrop-blur • Mensaje del asistente
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Ejemplos de Uso */}
          <section id="examples">
            <h2 
              className="mb-8 text-gray-900"
              style={{ 
                fontFamily: '"IBM Plex Sans", sans-serif', 
                fontSize: '24px', 
                fontWeight: '600' 
              }}
            >
              💡 Ejemplos de Implementación
            </h2>
            
            <div className="space-y-8">
              {/* Ejemplo de Conversación */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
                <h3 
                  className="mb-6 text-gray-700 text-center"
                  style={{ 
                    fontFamily: '"IBM Plex Sans", sans-serif', 
                    fontSize: '18px', 
                    fontWeight: '500' 
                  }}
                >
                  Ejemplo de Conversación
                </h3>
                <div className="space-y-4 max-w-lg mx-auto">
                  <UserBubble>
                    Hola, necesito ayuda con un proyecto urgente
                  </UserBubble>
                  <div className="flex items-center gap-2">
                    <AssistantBubble>
                      ¡Por supuesto! Te puedo ayudar con eso.
                    </AssistantBubble>
                    <UrgentChip />
                  </div>
                  <UserBubble>
                    Perfecto, empezamos entonces
                  </UserBubble>
                  <div className="flex justify-center gap-3 pt-4">
                    <PrimaryButton>Continuar</PrimaryButton>
                    <SecondaryButton>Cancelar</SecondaryButton>
                  </div>
                </div>
              </div>

              {/* Guía de Uso */}
              <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
                <h3 
                  className="mb-6 text-gray-700"
                  style={{ 
                    fontFamily: '"IBM Plex Sans", sans-serif', 
                    fontSize: '18px', 
                    fontWeight: '500' 
                  }}
                >
                  Guía de Uso
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 
                      className="mb-3 text-gray-800"
                      style={{ 
                        fontFamily: '"IBM Plex Sans", sans-serif', 
                        fontSize: '14px', 
                        fontWeight: '500' 
                      }}
                    >
                      ✅ Buenas Prácticas
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600" style={{ fontFamily: 'Inter' }}>
                      <li>• Usa un solo botón primario por sección</li>
                      <li>• Aplica colores semánticos consistentemente</li>
                      <li>• Mantén la jerarquía tipográfica</li>
                      <li>• Usa el espaciado de tokens definidos</li>
                    </ul>
                  </div>
                  <div>
                    <h4 
                      className="mb-3 text-gray-800"
                      style={{ 
                        fontFamily: '"IBM Plex Sans", sans-serif', 
                        fontSize: '14px', 
                        fontWeight: '500' 
                      }}
                    >
                      ❌ Evitar
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600" style={{ fontFamily: 'Inter' }}>
                      <li>• Múltiples botones primarios juntos</li>
                      <li>• Colores fuera de la paleta definida</li>
                      <li>• Tamaños de texto personalizados</li>
                      <li>• Espaciado inconsistente</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}