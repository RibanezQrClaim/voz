interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function StyleGuideNavigation({ activeSection, onSectionChange }: NavigationProps) {
  const sections = [
    { id: 'colors', label: 'Paleta de Colores', icon: 'ðŸŽ¨' },
    { id: 'typography', label: 'TipografÃ­as', icon: 'ðŸ“' },
    { id: 'components', label: 'Componentes', icon: 'ðŸ§©' },
    { id: 'examples', label: 'Ejemplos', icon: 'ðŸ’¡' }
  ];

  return (
    <nav className="w-64 bg-gray-50 border-r border-gray-200 fixed left-0 top-0 h-full overflow-y-auto z-20">
      <div className="p-6">
        <h2 
          className="text-gray-900 mb-6"
          style={{ 
            fontFamily: '"IBM Plex Sans", sans-serif', 
            fontSize: '20px', 
            fontWeight: '600' 
          }}
        >
          NavegaciÃ³n
        </h2>
        <ul className="space-y-2">
          {sections.map((section) => (
            <li key={section.id}>
              <button
                onClick={() => onSectionChange(section.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                  activeSection === section.id
                    ? 'bg-[#0EA5E9] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                style={{ fontFamily: 'Inter', fontSize: '14px' }}
              >
                <span className="text-lg">{section.icon}</span>
                {section.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}



