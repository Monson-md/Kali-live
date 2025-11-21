from fastapi import APIRouter
import os, time

router = APIRouter()
LOGFILE = os.path.join(os.path.dirname(__file__), "..", "audit.log")

def log_action(message: str):
    ts = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
    line = f"{ts} {message}\n"
    with open(LOGFILE, "a", encoding="utf-8") as f:
        f.write(line)

@router.post("/log")
def api_log(payload: dict):
    # payload may contain user, action, detail
    user = payload.get("user", "anon")
    action = payload.get("action", "unknown")
    detail = payload.get("detail", "")
    log_action(f"user={user} action={action} detail={detail}")
    return {"status":"ok"}
