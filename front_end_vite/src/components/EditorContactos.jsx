import React, { useEffect, useState } from 'react';

export default function EditorContactos({ usuarioId = 1 }) {
    const [contactos, setContactos] = useState({});
    const [nuevoCorreo, setNuevoCorreo] = useState('');
    const [nuevaEtiqueta, setNuevaEtiqueta] = useState('');
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        fetch(`http://localhost:5000/usuarios/${usuarioId}/contactos`)
            .then(res => res.json())
            .then(data => setContactos(data))
            .catch(() => setContactos({}));
    }, [usuarioId]);

    const handleAgregar = () => {
        const correo = nuevoCorreo.trim();
        const etiqueta = nuevaEtiqueta.trim();

        const correoValido = /^[\w\.\-\+]+@[\w\.-]+\.[a-zA-Z]{2,10}$/.test(correo) || /^\*@[\w\.-]+\.[a-zA-Z]{2,10}$/.test(correo);

        if (!correoValido) {
            setMensaje('âŒ Correo invÃ¡lido');
            setTimeout(() => setMensaje(''), 2000);
            return;
        }

        setContactos(prev => {
            const etiquetas = prev[correo] || [];
            if (etiqueta && !etiquetas.includes(etiqueta)) {
                etiquetas.push(etiqueta);
            }
            return { ...prev, [correo]: etiquetas };
        });

        setNuevoCorreo('');
        setNuevaEtiqueta('');
    };

    const handleEliminar = (correo) => {
        const nuevos = { ...contactos };
        delete nuevos[correo];
        setContactos(nuevos);
    };

    const handleGuardar = async () => {
        try {
            const res = await fetch(`http://localhost:5000/usuarios/${usuarioId}/contactos`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contactos),
            });
            const data = await res.json();
            setMensaje(data.mensaje || 'Guardado correctamente');
        } catch (e) {
            setMensaje('âŒ Error al guardar');
        }
        setTimeout(() => setMensaje(''), 3000);
    };

    return (
        <div className="p-4 border rounded mt-4">
            <h2 className="text-xl font-bold mb-4">Contactos personalizados</h2>

            {Object.entries(contactos).map(([correo, etiquetas]) => (
                <div key={correo} className="mb-2 flex items-center">
                    <span className="w-64 break-all pr-2">{correo}</span>
                    <span className="flex-1 text-sm text-gray-600 ml-2">{etiquetas.join(', ')}</span>
                    <button onClick={() => handleEliminar(correo)} className="text-red-600 ml-2">eliminar</button>
                </div>
            ))}

            <div className="flex space-x-2 mt-4">
                <input
                    className="border p-1 flex-1 mr-2"
                    placeholder="correo o dominio (ej: *"
                    value={nuevoCorreo}
                    onChange={(e) => setNuevoCorreo(e.target.value)}
                />
                <input
                    className="border p-1 w-40 mr-2"
                    placeholder="etiqueta (ej: proveedor)"
                    value={nuevaEtiqueta}
                    onChange={(e) => setNuevaEtiqueta(e.target.value)}
                />
                <button className="bg-gray-700 text-white px-2" onClick={handleAgregar}>+</button>
            </div>

            <button
                className="bg-green-600 text-white px-4 py-2 rounded mt-4"
                onClick={handleGuardar}
            >
                Guardar contactos
            </button>

            {mensaje && <div className="text-sm text-green-700 mt-2">{mensaje}</div>}
        </div>
    );
}



