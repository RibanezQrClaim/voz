import requests, json, time

API = "http://127.0.0.1:8000/api/comando"
BODY = {"texto": "¿Quién me escribió hoy?"}
HDRS = {"Content-Type": "application/json"}

def call(tag):
    try:
        r = requests.post(API, headers=HDRS, json=BODY, timeout=10)
        print(f"\n[{tag}] HTTP {r.status_code}")
        print(r.text)
    except Exception as e:
        print(f"[{tag}] ERROR: {e}")

def main():
    print("1) Probando 3 llamadas seguidas (para abrir breaker si simulate.error_rate_get=1.0)")
    for i in range(1, 4):
        call(f"try-{i}")

    print("\n2) Esperando cooldown 12s...")
    time.sleep(12)

    print("3) Llamada tras cooldown (si bajaste error_rate_get a 0.0 y reiniciaste el backend, debería volver a ok:true)")
    call("after-cooldown")

if __name__ == "__main__":
    main()
