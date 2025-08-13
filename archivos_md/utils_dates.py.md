### .\utils\dates.py

```py
from datetime import datetime

def get_rfc3339_today():
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    return int(today.timestamp())

```