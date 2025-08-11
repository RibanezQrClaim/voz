import os

def buscar_llm_calls(base_path="."):
    patrones_clave = [
        "openrouter",
        "api.openai.com",
        "Authorization",
        "requests.post",
        "fetch(",
        "model:",
        "chat/completions"
    ]

    print("🔍 Buscando llamadas a LLM/API...\n")

    for root, _, files in os.walk(base_path):
        for file in files:
            if file.endswith(".py"):
                ruta = os.path.join(root, file)
                with open(ruta, "r", encoding="utf-8", errors="ignore") as f:
                    for i, linea in enumerate(f, start=1):
                        if any(pat in linea for pat in patrones_clave):
                            print(f"{ruta} [Línea {i}]: {linea.strip()}")

if __name__ == "__main__":
    buscar_llm_calls()
