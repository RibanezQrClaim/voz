import { useState } from 'react';

export default function ConsultaRemitentes({ usuarioId = 1 }) {
    const [remitentes, setRemitentes] = useState([]);
    const [loading, setLoading] = useState(false);

    const consultar = async () => {
        setLoading(true);
        setRemitentes([]);
        try {
            const res = await fetch(`/api/gmail/quien-escribio-hoy?user_id=${usuarioId}`);
            const data = await res.json();
            setRemitentes(data.remitentes || []);
        } catch (err) {
            setRemitentes(['⚠️ Error al consultar']);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 border rounded-xl shadow bg-white max-w-xl">
            <h2 className="text-xl font-semibold mb-2">¿Quién me escribió hoy?</h2>
            <button
                onClick={consultar}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
            >
                Consultar
            </button>

            {loading && <p className="mt-3 text-gray-600">Consultando...</p>}

            <ul className="mt-4 list-disc list-inside">
                {remitentes.map((r, i) => (
                    <li key={i}>{r}</li>
                ))}
            </ul>
        </div>
    );
}
