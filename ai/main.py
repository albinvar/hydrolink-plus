from fastapi import FastAPI
from api import water_usage, water_quality, maintenance, leak_detection

app = FastAPI(title="HydroLink Plus API", version="1.0")

app.include_router(water_usage.router, prefix="/api", tags=["Water Usage"])
# app.include_router(water_quality.router, prefix="/api", tags=["Water Quality"])
# app.include_router(maintenance.router, prefix="/api", tags=["Predictive Maintenance"])
# app.include_router(leak_detection.router, prefix="/api", tags=["Leak Detection"])

@app.get("/")
def home():
    return {"message": "Welcome to HydroLink Plus API"}
