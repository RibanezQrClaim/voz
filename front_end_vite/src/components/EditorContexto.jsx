import React, { useEffect, useState } from 'react';

export default function EditorContexto({ usuarioId = 1 }) {
    const [contexto, setContexto] = useState({
        empresa: '',
        correos_internos: [],
        contactos_frecuentes: []
    });
    const [mensaje, setMensaje] = useState('');
    const [nuevoCorreo, setNuevoCorreo] = useState('');
    const [nuevoContacto, setNuevoContacto] = useState('');

    useEffect(() => {
        fetch(`http://localhost:5000/usuarios/${usuarioId}/contexto`)
            .then(res => res.json())
            .then(data => setContexto(data));
    }, [usuarioId]);

    const handleGuardar = async () => {
        const res = await fetch(`http://localhost:5000/usuarios/${usuarioId}/contexto`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contexto),
        });
        const data = await res.json();
        setMensaje(data.mensaje || 'Guardado');
        setTimeout(() => setMensaje(''), 2000);
    };

    const agregarItem = (tipo, valor) => {
        if (valor.trim() === '') return;
        setContexto(prev => ({
            ...prev,
            [tipo]: [...prev[tipo], valor.trim()]
        }));
        tipo === 'correos_internos' ? setNuevoCorreo('') : setNuevoContacto('');
    };

    const eliminarItem = (tipo, idx) => {
        const nuevos = [...contexto[tipo]];
        nuevos.splice(idx, 1);
        setContexto(prev => ({ ...prev, [tipo]: nuevos }));
    };

    return (
        <div className="p-4 border rounded mt-4">
            <h2 className="text-xl font-bold mb-4">Editar contexto</h2>

            <div className="mb-4">
                <label className="font-semibold block mb-1">Empresa:</label>
                <input
                    className="border p-1 w-full"
                    value={contexto.empresa}
                    onChange={(e) => setContexto({ ...contexto, empresa: e.target.value })}
                />
            </div>

            <div className="mb-4">
                <label className="font-semibold">Correos internos:</label>
                <ul className="mb-2">
                    {contexto.correos_internos.map((correo, i) => (
                        <li key={i} className="flex justify-between items-center">
                            {correo}
                            <button onClick={() => eliminarItem('correos_internos', i)} className="text-red-600">eliminar</button>
                        </li>
                    ))}
                </ul>
                <div className="flex space-x-2">
                    <input
                        className="border p-1 flex-1"
                        placeholder="nuevo correo"
                        value={nuevoCorreo}
                        onChange={(e) => setNuevoCorreo(e.target.value)}
                    />
                    <button className="bg-gray-700 text-white px-2" onClick={() => agregarItem('correos_internos', nuevoCorreo)}>+</button>
                </div>
            </div>

            <div className="mb-4">
                <label className="font-semibold">Contactos frecuentes:</label>
                <ul className="mb-2">
                    {contexto.contactos_frecuentes.map((c, i) => (
                        <li key={i} className="flex justify-between items-center">
                            {c}
                            <button onClick={() => eliminarItem('contactos_frecuentes', i)} className="text-red-600">eliminar</button>
                        </li>
                    ))}
                </ul>
                <div className="flex space-x-2">
                    <input
                        className="border p-1 flex-1"
                        placeholder="nuevo contacto"
                        value={nuevoContacto}
                        onChange={(e) => setNuevoContacto(e.target.value)}
                    />
                    <button className="bg-gray-700 text-white px-2" onClick={() => agregarItem('contactos_frecuentes', nuevoContacto)}>+</button>
                </div>
            </div>

            <button
                className="bg-green-600 text-white px-4 py-2 rounded"
                onClick={handleGuardar}
            >
                Guardar contexto
            </button>

            {mensaje && <div className="text-sm text-green-700 mt-2">{mensaje}</div>}
        </div>
    );
}



