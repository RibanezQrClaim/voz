### .\test_gmail.py

```py
from interfaces.gmail_api import obtener_correos_recientes

if __name__ == "__main__":
    correos = obtener_correos_recientes()
    for c in correos:
        print(c)

```