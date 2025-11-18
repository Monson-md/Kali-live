from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
import ipaddress, random

router = APIRouter()

class ScanRequest(BaseModel):
    target: str  # hostname or ip (for education only)
    ports: List[int] = [22,80,443]

class PortReport(BaseModel):
    port: int
    state: str
    service: str | None
    note: str | None

@router.post("/simulate-scan", response_model=List[PortReport])
def simulate_scan(body: ScanRequest):
    # Validate target format superficially
    try:
        # allow hostnames but try ip validation for safety
        if body.target.replace(".", "").isdigit():
            ipaddress.ip_address(body.target)
    except Exception:
        # keep moving, do not perform any network I/O
        pass

    services = {22:"ssh",80:"http",443:"https",3306:"mysql",21:"ftp"}
    report = []
    for p in body.ports:
        # deterministic pseudo-random based on target+port
        rand = (sum(ord(c) for c in body.target) + p) % 10
        state = "open" if rand < 3 else "closed" if rand < 7 else "filtered"
        service = services.get(p)
        note = "Simulated result for training. Aucun scan réel effectué. Interprétez ce résultat pour comprendre les ports et services."
        report.append({"port": p, "state": state, "service": service, "note": note})
    return report
