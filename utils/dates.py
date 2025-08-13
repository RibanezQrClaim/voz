from datetime import datetime
from zoneinfo import ZoneInfo

TZ_SCL = ZoneInfo("America/Santiago")

def get_rfc3339_today():
    today = datetime.now(TZ_SCL).replace(hour=0, minute=0, second=0, microsecond=0)
    return int(today.timestamp())
