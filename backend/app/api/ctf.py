from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import uuid
import os, json

router = APIRouter()
STORE_PATH = os.path.join(os.path.dirname(__file__), "..", "data")
os.makedirs(STORE_PATH, exist_ok=True)
DB_FILE = os.path.join(STORE_PATH, "ctf_store.json")

def _load():
    if not os.path.exists(DB_FILE):
        return {}
    with open(DB_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def _save(db):
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(db, f, indent=2, ensure_ascii=False)

class ChallengeCreate(BaseModel):
    title: str
    category: str  # ex: web, crypto, forensics
    description: str
    flag: str      # store hashed in prod; plain for MVP lab
    points: int = 100

class ChallengeOut(BaseModel):
    id: str
    title: str
    category: str
    description: str
    points: int

@router.post("/create", response_model=ChallengeOut)
def create_challenge(ch: ChallengeCreate):
    db = _load()
    cid = str(uuid.uuid4())
    db[cid] = {
        "title": ch.title,
        "category": ch.category,
        "description": ch.description,
        "flag": ch.flag,
        "points": ch.points
    }
    _save(db)
    return {"id": cid, "title": ch.title, "category": ch.category, "description": ch.description, "points": ch.points}

@router.get("/list", response_model=List[ChallengeOut])
def list_challenges():
    db = _load()
    out = []
    for k,v in db.items():
        out.append({"id": k, "title": v["title"], "category": v["category"], "description": v["description"], "points": v["points"]})
    return out

class FlagCheck(BaseModel):
    id: str
    flag: str
    user: str | None = None

@router.post("/check-flag")
def check_flag(body: FlagCheck):
    db = _load()
    if body.id not in db:
        raise HTTPException(status_code=404, detail="Challenge not found")
    correct = db[body.id]["flag"]
    ok = (body.flag == correct)
    # log attempt (simple)
    try:
        from . import audit
        audit.log_action(f"flag-check id={body.id} user={body.user} ok={ok}")
    except Exception:
        pass
    return {"result": "correct" if ok else "incorrect", "points": db[body.id]["points"] if ok else 0}
