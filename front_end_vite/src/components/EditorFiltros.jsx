import React, { useEffect, useState } from 'react';

export default function EditorFiltros({ usuarioId = 1 }) {
    const [filtros, setFiltros] = useState({});
    const [nuevaClave, setNuevaClave] = useState('');
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        fetch(`http://localhost:5000/usuarios/${usuarioId}/filtros`)
            .then(res => res.json())
            .then(data => setFiltros(data));
    }, [usuarioId]);

    const handleCambio = (clave, valor) => {
        setFiltros(prev => ({
            ...prev,
            [clave]: valor.split(',').map(p => p.trim())
        }));
    };

    const handleAgregarClave = () => {
        if (nuevaClave && !filtros[nuevaClave]) {
            setFiltros(prev => ({ ...prev, [nuevaClave]: [] }));
            setNuevaClave('');
        }
    };

    const handleEliminarClave = (clave) => {
        const nuevos = { ...filtros };
        delete nuevos[clave];
        setFiltros(nuevos);
    };

    const handleGuardar = async () => {
        const res = await fetch(`http://localhost:5000/usuarios/${usuarioId}/filtros`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(filtros),
        });
        const data = await res.json();
        setMensaje(data.mensaje || 'Guardado');
        setTimeout(() => setMensaje(''), 2000);
    };

    return (
        <div className="p-4 border rounded mt-4">
            <h2 className="text-xl font-bold mb-2">Editar filtros</h2>

            {Object.entries(filtros).map(([clave, palabras]) => (
                <div key={clave} className="mb-2 flex items-center">
                    <label className="font-semibold w-32">{clave}:</label>
                    <input
                        className="border p-1 flex-1 mr-2"
                        value={palabras.join(', ')}
                        onChange={(e) => handleCambio(clave, e.target.value)}
                    />
                    <button
                        onClick={() => handleEliminarClave(clave)}
                        className="text-red-600 hover:underline"
                    >
                        eliminar
                    </button>
                </div>
            ))}

            <div className="flex mt-4 space-x-2">
                <input
                    className="border p-1 flex-1"
                    placeholder="nuevo filtro (ej: cliente)"
                    value={nuevaClave}
                    onChange={(e) => setNuevaClave(e.target.value)}
                />
                <button
                    className="bg-gray-700 text-white px-4 rounded"
                    onClick={handleAgregarClave}
                >
                    +
                </button>
            </div>

            <button
                className="bg-green-600 text-white px-4 py-2 rounded mt-4"
                onClick={handleGuardar}
            >
                Guardar filtros
            </button>

            {mensaje && <div className="text-sm text-green-700 mt-2">{mensaje}</div>}
        </div>
    );
}

