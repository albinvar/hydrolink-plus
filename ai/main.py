from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from api import water_usage, water_quality, maintenance, leak_detection

app = FastAPI(title="HydroLink Plus API", version="1.0")

app.include_router(water_usage.router, prefix="/api", tags=["Water Usage"])
# app.include_router(water_quality.router, prefix="/api", tags=["Water Quality"])
# app.include_router(maintenance.router, prefix="/api", tags=["Predictive Maintenance"])
# app.include_router(leak_detection.router, prefix="/api", tags=["Leak Detection"])

# Serve static files (images, JS, etc.)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Set up templates directory
templates = Jinja2Templates(directory="templates")

@app.get("/forecast", response_class=HTMLResponse)
async def serve_forecast_page(request: Request):
    return templates.TemplateResponse("forecast.html", {"request": request})

@app.get("/")
def home():
    return {"message": "Welcome to HydroLink Plus API"}
