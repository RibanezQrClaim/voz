### .\frontend\index_bloques.html

```html
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Asistente Gmail por Voz</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>

<body class="flex h-screen font-sans">
    <aside class="w-64 bg-gray-100 p-4 border-r">
        <h2 class="text-lg font-semibold mb-4">Comandos</h2>

        <!-- Botón de Login/Logout con Gmail -->
        <div class="mb-4">
            <button id="authBtn"
                class="w-full border py-2 px-3 bg-green-100 hover:bg-green-200 text-green-800 font-semibold"
                onclick="handleAuth()">Conectar Gmail</button>
        </div>

        <button class="w-full border mb-2 py-2 px-3 bg-white hover:bg-gray-200"
            onclick="sendCommand('¿Quién me escribió hoy?')">¿Quién me escribió hoy?</button>
        <button class="w-full border mb-2 py-2 px-3 bg-white hover:bg-gray-200"
            onclick="sendCommand('Resúmeme los correos')">Resúmeme los correos</button>
        <button class="w-full border mb-2 py-2 px-3 bg-white hover:bg-gray-200"
            onclick="sendCommand('¿Tengo correos sin leer?')">¿Tengo correos sin leer?</button>
    </aside>

    <main class="flex flex-col flex-1">
        <div id="chat" class="flex-1 overflow-y-auto p-4 space-y-4 bg-white"></div>
        <div class="flex items-center p-4 border-t gap-2">
            <input id="input" type="text" placeholder="Escribe tu comando..." class="flex-1 border px-3 py-2 rounded" />
            <button onclick="sendInput()"
                class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Enviar</button>
            <button onclick="startVoice()" id="micBtn"
                class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">🎤</button>
        </div>
    </main>

    <script>
        const input = document.getElementById('input');
        const chat = document.getElementById('chat');
        const micBtn = document.getElementById('micBtn');

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendInput();
        });

        async function sendCommand(texto) {
            input.value = texto;
            sendInput();
        }

        async function sendInput() {
            const mensaje = input.value.trim();
            if (!mensaje) return;

            appendMessage('🧑‍💼', mensaje);
            input.value = '';

            try {
                const res = await fetch('/api/comando', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ comando: mensaje, usuario_id: "1" })
                });

                const data = await res.json();
                const respuesta = data.respuesta || "Respuesta vacía.";

                if (respuesta.includes('-----')) {
                    const bloques = respuesta.split('-----').map(b => b.trim()).filter(b => b);
                    bloques.forEach(b => {
                        appendBlock(b);
                        speak(b);
                    });
                } else {
                    appendMessage('🤖', respuesta);
                    speak(respuesta);
                }

                chat.scrollTop = chat.scrollHeight;
            } catch (err) {
                appendMessage('⚠️', 'Error al conectar con el servidor.');
            }
        }

        function appendMessage(icono, texto) {
            const div = document.createElement('div');
            div.className = 'whitespace-pre-wrap';
            div.innerHTML = `${icono} ${texto}`;
            chat.appendChild(div);
        }

        function appendBlock(texto) {
            const block = document.createElement('div');
            block.className = 'bg-gray-50 border border-gray-200 p-3 rounded';
            block.innerText = texto;
            chat.appendChild(block);
        }

        function speak(text) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'es-CL';
            speechSynthesis.speak(utterance);
        }

        function startVoice() {
            if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
                alert('Tu navegador no soporta reconocimiento de voz.');
                return;
            }

            const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            recognition.lang = 'es-CL';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.start();
            micBtn.classList.add('animate-pulse');

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                input.value = transcript;
                sendInput();
            };

            recognition.onend = () => {
                micBtn.classList.remove('animate-pulse');
            };

            recognition.onerror = () => {
                micBtn.classList.remove('animate-pulse');
                appendMessage('⚠️', 'Error al usar el micrófono.');
            };
        }

        // Login/Logout con Gmail
        let loggedIn = false;

        async function handleAuth() {
            const btn = document.getElementById('authBtn');
            if (!loggedIn) {
                window.location.href = '/auth/login'; // Lanza flujo OAuth
            } else {
                await fetch('/auth/logout');
                loggedIn = false;
                btn.textContent = 'Conectar Gmail';
                btn.classList.remove('bg-red-100', 'text-red-800');
                btn.classList.add('bg-green-100', 'text-green-800');
            }
        }

        window.addEventListener('DOMContentLoaded', async () => {
            try {
                const res = await fetch('/auth/status');
                const data = await res.json();
                if (data.logged_in) {
                    loggedIn = true;
                    const btn = document.getElementById('authBtn');
                    btn.textContent = 'Desconectar Gmail';
                    btn.classList.remove('bg-green-100', 'text-green-800');
                    btn.classList.add('bg-red-100', 'text-red-800');
                }
            } catch (err) {
                console.warn('No se pudo verificar el estado de login.');
            }
        });
    </script>
</body>

</html>
```