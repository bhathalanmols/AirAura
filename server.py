from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import logging
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional, List

import bcrypt
import jwt
from bson import ObjectId
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field

from aqi_data import (
    STATIONS,
    current_reading,
    history_24h,
    forecast_7d,
    health_tips_for,
    category_for_aqi,
)

# ---------- DB ----------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# ---------- App ----------
app = FastAPI(title="AirAura API")
api = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

JWT_ALGORITHM = "HS256"


def jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
        "type": "access",
    }
    return jwt.encode(payload, jwt_secret(), algorithm=JWT_ALGORITHM)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> dict:
    if credentials is None or not credentials.credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, jwt_secret(), algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    user["id"] = str(user["_id"])
    user.pop("_id", None)
    user.pop("password_hash", None)
    return user


def require_role(*roles: str):
    async def _checker(user: dict = Depends(get_current_user)) -> dict:
        if user.get("role") not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return _checker


# ---------- Models ----------
class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)
    role: str = Field(default="student")  # student | pcb_official
    home_station_id: Optional[str] = None


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class AdvisoryIn(BaseModel):
    title: str
    message: str
    severity: str = Field(default="moderate")  # good | moderate | poor | severe
    station_ids: List[str] = Field(default_factory=list)


# ---------- Auth Routes ----------
@api.post("/auth/register")
async def register(data: RegisterIn):
    email = data.email.lower().strip()
    if data.role not in ("student", "pcb_official"):
        raise HTTPException(status_code=400, detail="Invalid role")
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    doc = {
        "name": data.name,
        "email": email,
        "password_hash": hash_password(data.password),
        "role": data.role,
        "home_station_id": data.home_station_id or "thapar-campus",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    res = await db.users.insert_one(doc)
    user_id = str(res.inserted_id)
    token = create_access_token(user_id, email, data.role)
    return {
        "token": token,
        "user": {
            "id": user_id,
            "name": data.name,
            "email": email,
            "role": data.role,
            "home_station_id": doc["home_station_id"],
        },
    }


@api.post("/auth/login")
async def login(data: LoginIn):
    email = data.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    user_id = str(user["_id"])
    token = create_access_token(user_id, email, user["role"])
    return {
        "token": token,
        "user": {
            "id": user_id,
            "name": user.get("name"),
            "email": email,
            "role": user["role"],
            "home_station_id": user.get("home_station_id", "thapar-campus"),
        },
    }


@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return {"user": user}


# ---------- Station / AQI Routes ----------
@api.get("/stations")
async def list_stations():
    """Return all stations with current readings."""
    out = []
    for s in STATIONS:
        r = current_reading(s)
        out.append({
            **{k: s[k] for k in ("id", "name", "city", "state", "lat", "lng", "type")},
            "current": r,
        })
    return {"stations": out}


@api.get("/stations/search")
async def search_stations(q: str = ""):
    q = (q or "").lower().strip()
    if not q:
        return {"results": []}
    matches = [
        s for s in STATIONS
        if q in s["name"].lower() or q in s["city"].lower() or q in s["state"].lower()
    ]
    return {"results": [
        {**{k: s[k] for k in ("id", "name", "city", "state", "type")}, "current": current_reading(s)}
        for s in matches[:10]
    ]}


def _find_station(station_id: str) -> dict:
    for s in STATIONS:
        if s["id"] == station_id:
            return s
    raise HTTPException(status_code=404, detail="Station not found")


@api.get("/stations/{station_id}")
async def get_station(station_id: str):
    s = _find_station(station_id)
    reading = current_reading(s)
    return {
        "station": {k: s[k] for k in ("id", "name", "city", "state", "lat", "lng", "type")},
        "current": reading,
        "health_tips": health_tips_for(reading["category"]["code"]),
    }


@api.get("/stations/{station_id}/history")
async def get_history(station_id: str):
    s = _find_station(station_id)
    return {"history": history_24h(s)}


@api.get("/stations/{station_id}/forecast")
async def get_forecast(station_id: str):
    s = _find_station(station_id)
    return {"forecast": forecast_7d(s)}


# ---------- PCB Overview ----------
@api.get("/overview")
async def overview(user: dict = Depends(require_role("pcb_official"))):
    readings = []
    buckets = {"good": 0, "moderate": 0, "poor": 0, "severe": 0}
    for s in STATIONS:
        r = current_reading(s)
        buckets[r["category"]["code"]] += 1
        readings.append({
            **{k: s[k] for k in ("id", "name", "city", "state", "lat", "lng", "type")},
            "current": r,
        })
    readings.sort(key=lambda x: x["current"]["aqi"], reverse=True)
    worst = readings[:3]
    best = sorted(readings, key=lambda x: x["current"]["aqi"])[:3]
    avg = round(sum(r["current"]["aqi"] for r in readings) / len(readings)) if readings else 0
    return {
        "summary": {
            "total_stations": len(readings),
            "average_aqi": avg,
            "average_category": category_for_aqi(avg),
            "buckets": buckets,
        },
        "hotspots": worst,
        "cleanest": best,
        "stations": readings,
    }


# ---------- Advisories ----------
@api.get("/advisories")
async def list_advisories():
    docs = await db.advisories.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return {"advisories": docs}


@api.post("/advisories")
async def create_advisory(
    data: AdvisoryIn,
    user: dict = Depends(require_role("pcb_official")),
):
    doc = {
        "id": str(uuid.uuid4()),
        "title": data.title,
        "message": data.message,
        "severity": data.severity,
        "station_ids": data.station_ids,
        "author_name": user.get("name"),
        "author_email": user.get("email"),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.advisories.insert_one(doc)
    doc.pop("_id", None)
    return {"advisory": doc}


@api.get("/")
async def root():
    return {"service": "AirAura API", "status": "ok"}


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# ---------- Startup ----------
@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)

    # Seed demo accounts
    seed_accounts = [
        {
            "email": os.environ.get("ADMIN_EMAIL", "admin@ppcb.gov.in"),
            "password": os.environ.get("ADMIN_PASSWORD", "admin@123"),
            "name": "PPCB Administrator",
            "role": "pcb_official",
            "home_station_id": "patiala-city",
        },
        {
            "email": os.environ.get("STUDENT_DEMO_EMAIL", "student@thapar.edu"),
            "password": os.environ.get("STUDENT_DEMO_PASSWORD", "thapar@123"),
            "name": "Thapar Student",
            "role": "student",
            "home_station_id": "thapar-campus",
        },
    ]
    for acc in seed_accounts:
        existing = await db.users.find_one({"email": acc["email"]})
        if existing is None:
            await db.users.insert_one({
                "email": acc["email"],
                "password_hash": hash_password(acc["password"]),
                "name": acc["name"],
                "role": acc["role"],
                "home_station_id": acc["home_station_id"],
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
            logger.info("Seeded account: %s", acc["email"])
        elif not verify_password(acc["password"], existing["password_hash"]):
            await db.users.update_one(
                {"email": acc["email"]},
                {"$set": {"password_hash": hash_password(acc["password"])}},
            )
            logger.info("Updated password for: %s", acc["email"])

    # Seed sample advisories if empty
    count = await db.advisories.count_documents({})
    if count == 0:
        samples = [
            {
                "id": str(uuid.uuid4()),
                "title": "Stubble Burning Alert - Ludhiana Belt",
                "message": "Elevated PM2.5 levels detected across Ludhiana region due to paddy stubble burning. Residents advised to wear N95 masks outdoors.",
                "severity": "severe",
                "station_ids": ["ludhiana-civil", "ludhiana-focal"],
                "author_name": "PPCB Administrator",
                "author_email": "admin@ppcb.gov.in",
                "created_at": datetime.now(timezone.utc).isoformat(),
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Improved Air Quality - Patiala",
                "message": "AQI levels in Patiala have improved to moderate range following overnight rainfall. Outdoor activities permissible with caution.",
                "severity": "moderate",
                "station_ids": ["patiala-city", "thapar-campus"],
                "author_name": "PPCB Administrator",
                "author_email": "admin@ppcb.gov.in",
                "created_at": (datetime.now(timezone.utc) - timedelta(hours=6)).isoformat(),
            },
        ]
        await db.advisories.insert_many(samples)


@app.on_event("shutdown")
async def on_shutdown():
    client.close()
