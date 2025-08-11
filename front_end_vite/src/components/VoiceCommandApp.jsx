import React from 'react';
import { useState } from 'react';

export default function VoiceCommandApp() {
  const [texto, setTexto] = useState('');
  const [respuesta, setRespuesta] = useState('');
  const [grabando, setGrabando] = useState(false);

  const handleHablar = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Tu navegador no soporta reconocimiento de voz');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setTexto(transcript);
      setGrabando(false);
    };

    recognition.onerror = (event) => {
      console.error('Error de reconocimiento:', event.error);
      setGrabando(false);
    };

    recognition.onend = () => {
      setGrabando(false);
    };

    setGrabando(true);
    recognition.start();
  };

  const handleEnviar = async () => {
    try {
      const res = await fetch('http://localhost:5000/comando/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comando: texto, usuario_id: 1 }),
      });

      const data = await res.json();
      const respuestaTexto = data.respuesta || '⚠️ Sin respuesta del servidor.';
      setRespuesta(respuestaTexto);

      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(respuestaTexto);
      utterance.lang = 'es-ES';
      synth.speak(utterance);
    } catch (error) {
      console.error('Error al conectar con backend:', error);
      setRespuesta('❌ Error al conectar con el servidor.');
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Asistente de Voz para Gmail</h1>

      <textarea
        className="border p-2 w-full h-24"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Di o escribe un comando..."
      />

      <div className="flex space-x-2 mt-2">
        <button
          onClick={handleHablar}
          className="bg-purple-500 text-white px-4 py-2 rounded"
        >
          {grabando ? 'Detener' : '🎙️ Hablar'}
        </button>

        <button
          onClick={handleEnviar}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Enviar comando
        </button>
      </div>

      {respuesta && (
        <div className="mt-4 text-green-700">
          <strong>Respuesta:</strong> {respuesta}
        </div>
      )}
    </div>
  );
}


