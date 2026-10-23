"""Seed monitoring stations and synthetic time-series readings for AirAura."""
import math
import random
from datetime import datetime, timedelta, timezone

STATIONS = [
    {
        "id": "thapar-campus",
        "name": "Thapar Institute Campus",
        "city": "Patiala",
        "state": "Punjab",
        "lat": 30.3540,
        "lng": 76.3680,
        "type": "academic",
        "baseline_pm25": 58,
    },
    {
        "id": "patiala-city",
        "name": "Patiala City Center",
        "city": "Patiala",
        "state": "Punjab",
        "lat": 30.3398,
        "lng": 76.3869,
        "type": "urban",
        "baseline_pm25": 92,
    },
    {
        "id": "rajpura-industrial",
        "name": "Rajpura Industrial Estate",
        "city": "Rajpura",
        "state": "Punjab",
        "lat": 30.4836,
        "lng": 76.5945,
        "type": "industrial",
        "baseline_pm25": 145,
    },
    {
        "id": "ludhiana-civil",
        "name": "Ludhiana Civil Lines",
        "city": "Ludhiana",
        "state": "Punjab",
        "lat": 30.9010,
        "lng": 75.8573,
        "type": "urban",
        "baseline_pm25": 168,
    },
    {
        "id": "ludhiana-focal",
        "name": "Ludhiana Focal Point",
        "city": "Ludhiana",
        "state": "Punjab",
        "lat": 30.8650,
        "lng": 75.9020,
        "type": "industrial",
        "baseline_pm25": 212,
    },
    {
        "id": "amritsar-hall",
        "name": "Amritsar Hall Bazaar",
        "city": "Amritsar",
        "state": "Punjab",
        "lat": 31.6340,
        "lng": 74.8723,
        "type": "urban",
        "baseline_pm25": 124,
    },
    {
        "id": "jalandhar-junction",
        "name": "Jalandhar Junction",
        "city": "Jalandhar",
        "state": "Punjab",
        "lat": 31.3260,
        "lng": 75.5762,
        "type": "urban",
        "baseline_pm25": 108,
    },
    {
        "id": "bathinda-refinery",
        "name": "Bathinda Refinery Outskirts",
        "city": "Bathinda",
        "state": "Punjab",
        "lat": 30.2110,
        "lng": 74.9455,
        "type": "industrial",
        "baseline_pm25": 188,
    },
    {
        "id": "chandigarh-s17",
        "name": "Chandigarh Sector 17",
        "city": "Chandigarh",
        "state": "Chandigarh",
        "lat": 30.7416,
        "lng": 76.7836,
        "type": "urban",
        "baseline_pm25": 76,
    },
    {
        "id": "mohali-airport",
        "name": "Mohali Airport Road",
        "city": "Mohali",
        "state": "Punjab",
        "lat": 30.6951,
        "lng": 76.7250,
        "type": "residential",
        "baseline_pm25": 88,
    },
    {
        "id": "shimla-mall",
        "name": "Shimla Mall Road",
        "city": "Shimla",
        "state": "Himachal Pradesh",
        "lat": 31.1048,
        "lng": 77.1734,
        "type": "tourist",
        "baseline_pm25": 38,
    },
    {
        "id": "delhi-anandvihar",
        "name": "Delhi Anand Vihar",
        "city": "Delhi",
        "state": "Delhi",
        "lat": 28.6469,
        "lng": 77.3155,
        "type": "urban",
        "baseline_pm25": 235,
    },
]


def aqi_from_pm25(pm25: float) -> int:
    """US-EPA-style AQI calculation from PM2.5."""
    breakpoints = [
        (0.0, 12.0, 0, 50),
        (12.1, 35.4, 51, 100),
        (35.5, 55.4, 101, 150),
        (55.5, 150.4, 151, 200),
        (150.5, 250.4, 201, 300),
        (250.5, 350.4, 301, 400),
        (350.5, 500.4, 401, 500),
    ]
    pm25 = max(0.0, min(pm25, 500.0))
    for c_low, c_high, a_low, a_high in breakpoints:
        if c_low <= pm25 <= c_high:
            return round(((a_high - a_low) / (c_high - c_low)) * (pm25 - c_low) + a_low)
    return 500


def category_for_aqi(aqi: int) -> dict:
    if aqi <= 50:
        return {"label": "Good", "color": "#10B981", "code": "good"}
    if aqi <= 100:
        return {"label": "Moderate", "color": "#F59E0B", "code": "moderate"}
    if aqi <= 150:
        return {"label": "Unhealthy for Sensitive", "color": "#F97316", "code": "poor"}
    if aqi <= 200:
        return {"label": "Unhealthy", "color": "#F97316", "code": "poor"}
    if aqi <= 300:
        return {"label": "Very Unhealthy", "color": "#EF4444", "code": "severe"}
    return {"label": "Hazardous", "color": "#7F1D1D", "code": "severe"}


def _diurnal_factor(hour: int) -> float:
    """Pollution typically peaks early morning and evening rush hour."""
    return 1.0 + 0.25 * math.sin((hour - 6) / 12 * math.pi) + 0.12 * math.cos(hour / 6 * math.pi)


def synth_reading(station: dict, ts: datetime, seed_offset: int = 0) -> dict:
    rnd = random.Random(f"{station['id']}-{ts.isoformat()}-{seed_offset}")
    base = station["baseline_pm25"]
    diurnal = _diurnal_factor(ts.hour)
    noise = rnd.uniform(-0.18, 0.22)
    pm25 = max(4.0, base * diurnal * (1 + noise))
    pm10 = pm25 * rnd.uniform(1.4, 1.9)
    co2 = 380 + (pm25 / 200) * 600 + rnd.uniform(-30, 80)
    no2 = max(5, pm25 * rnd.uniform(0.18, 0.32))
    so2 = max(2, pm25 * rnd.uniform(0.05, 0.15))
    o3 = max(8, 30 + (24 - abs(ts.hour - 14)) * rnd.uniform(0.8, 1.8))
    temp = 18 + 9 * math.sin((ts.hour - 9) / 12 * math.pi) + rnd.uniform(-1.5, 1.5)
    humidity = max(20, min(95, 65 - (temp - 22) * 1.6 + rnd.uniform(-6, 6)))
    aqi = aqi_from_pm25(pm25)
    return {
        "timestamp": ts.isoformat(),
        "pm25": round(pm25, 1),
        "pm10": round(pm10, 1),
        "co2": round(co2, 0),
        "no2": round(no2, 1),
        "so2": round(so2, 1),
        "o3": round(o3, 1),
        "temperature": round(temp, 1),
        "humidity": round(humidity, 1),
        "aqi": aqi,
        "category": category_for_aqi(aqi),
    }


def history_24h(station: dict, now: datetime | None = None) -> list[dict]:
    now = now or datetime.now(timezone.utc)
    return [
        synth_reading(station, now - timedelta(hours=23 - i))
        for i in range(24)
    ]


def forecast_7d(station: dict, now: datetime | None = None) -> list[dict]:
    now = now or datetime.now(timezone.utc)
    out = []
    # Linear drift trend + noise across upcoming days
    drift = random.Random(station["id"]).uniform(-0.06, 0.08)
    for i in range(1, 8):
        future = now + timedelta(days=i)
        scaled = dict(station)
        scaled["baseline_pm25"] = station["baseline_pm25"] * (1 + drift * i)
        # noon-ish forecast
        ts = future.replace(hour=12, minute=0, second=0, microsecond=0)
        r = synth_reading(scaled, ts, seed_offset=i)
        out.append({
            "date": future.date().isoformat(),
            "aqi": r["aqi"],
            "pm25": r["pm25"],
            "category": r["category"],
        })
    return out


def current_reading(station: dict) -> dict:
    return synth_reading(station, datetime.now(timezone.utc))


HEALTH_TIPS = {
    "good": [
        "Air quality is excellent. Perfect day for outdoor activities and exercise.",
        "Open windows to let fresh air circulate indoors.",
    ],
    "moderate": [
        "Generally safe outside. Sensitive individuals should limit prolonged exertion.",
        "Consider a light walk; keep windows open during morning hours only.",
    ],
    "poor": [
        "Wear an N95 mask outdoors. Reduce outdoor exercise.",
        "Use air purifiers indoors. Avoid burning incense or candles.",
        "Children and elderly should stay indoors during peak hours.",
    ],
    "severe": [
        "Stay indoors. Air purifier ON. Wear N95 if you must go out.",
        "Avoid all outdoor exercise. Close all windows.",
        "Consult a doctor immediately if you have breathing difficulty.",
    ],
}


def health_tips_for(category_code: str) -> list[str]:
    return HEALTH_TIPS.get(category_code, HEALTH_TIPS["moderate"])
