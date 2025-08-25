import requests, time, json, statistics as stats

API = "http://127.0.0.1:8000/api/comando"
BODY = {"texto": "¿Quién me escribió hoy?"}
HDRS = {"Content-Type": "application/json"}

def timed_call(tag: str):
    t0 = time.perf_counter()
    r = requests.post(API, headers=HDRS, json=BODY, timeout=15)
    dt = (time.perf_counter() - t0) * 1000.0
    print(f"[{tag}] HTTP {r.status_code}  in {dt:.1f} ms")
    try:
        payload = r.json()
        # muestra solo campo clave para no ensuciar la consola
        print("   -> keys:", list(payload.keys()))
    except Exception:
        print("   -> body:", r.text[:160], "...")
    return dt

def main():
    print("=== QA Cache TTL (debe ser más rápido en la 2da llamada) ===")
    t1 = timed_call("1st (miss)")
    t2 = timed_call("2nd (hit)")
    # repetimos algunas veces para estabilidad
    extra = [timed_call(f"hit-{i}") for i in range(1, 4)]
    print("\nResumen:")
    print(f"  1st (miss): {t1:.1f} ms")
    print(f"  2nd (hit):  {t2:.1f} ms")
    if extra:
        print(f"  hits mean:  {stats.mean(extra):.1f} ms")
    speedup = (t1 / t2) if t2 > 0 else float('inf')
    print(f"  speedup 1st→2nd: x{speedup:.2f} (esperado ≥ x2 con simulate.latency_ms≥80)")

if __name__ == "__main__":
    main()
