import React, { useState } from 'react';
import VoiceCommandApp from './components/VoiceCommandApp';
import EditorFiltros from './components/EditorFiltros';
import EditorContexto from './components/EditorContexto';
import EditorContactos from './components/EditorContactos';

export default function App() {
  const [vista, setVista] = useState('asistente');

  return (
    <div className="p-6">
      <div className="flex space-x-2 mb-4">
        <button
          className={`px-4 py-2 rounded ${vista === 'asistente' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setVista('asistente')}
        >
          Asistente
        </button>
        <button
          className={`px-4 py-2 rounded ${vista === 'filtros' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setVista('filtros')}
        >
          Editar filtros
        </button>
        <button
          className={`px-4 py-2 rounded ${vista === 'contexto' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setVista('contexto')}
        >
          Editar contexto
        </button>
        <button
          className={`px-4 py-2 rounded ${vista === 'contactos' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setVista('contactos')}
        >
          Contactos
        </button>
      </div>

      {vista === 'asistente' && <VoiceCommandApp />}
      {vista === 'filtros' && <EditorFiltros />}
      {vista === 'contexto' && <EditorContexto />}
      {vista === 'contactos' && <EditorContactos />}
    </div>
  );
}


