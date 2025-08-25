import json, time, requests, sys

API = "http://127.0.0.1:8000/api/comando"
BODY = {"texto": "¿Quién me escribió hoy?"}
HDRS = {"Content-Type": "application/json"}
CFG = "config.json"

def patch_error_rate(rate: float):
    with open(CFG, "r", encoding="utf-8") as f:
        cfg = json.load(f)
    cfg["gmail"]["simulate"]["error_rate_get"] = rate
    with open(CFG, "w", encoding="utf-8") as f:
        json.dump(cfg, f, ensure_ascii=False, indent=2)
    print(f"[cfg] simulate.error_rate_get = {rate} (recarga/reinicia backend si no se auto-recarga)")

def post_once(tag: str):
    try:
        r = requests.post(API, json=BODY, headers=HDRS, timeout=10)
        print(f"[{tag}] status={r.status_code}")
        print(r.text)
        return r.status_code
    except Exception as e:
        print(f"[{tag}] EXC: {e}")
        return -1

def main():
    print("1) Forzamos errores: rate=1.0 → abrir breaker")
    patch_error_rate(1.0)
    for i in range(1, 4):
        post_once(f"fail-{i}")
    s = post_once("breaker-open")
    if s == 503:
        print("👍 breaker OPEN (503 con retry_after_s)")

    print("2) Esperamos cooldown 10s...")
    time.sleep(11)

    print("3) Permitimos éxito para cerrar breaker: rate=0.0")
    patch_error_rate(0.0)
    print("   >> reinicia el backend si no recarga config automáticamente")
    input("   Presiona Enter cuando el backend esté arriba...")

    post_once("half-open->closed")

if __name__ == "__main__":
    main()
