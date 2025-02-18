from fastapi import APIRouter, UploadFile, File, HTTPException
import os
import pandas as pd
from services.train_lstm import train_and_predict

router = APIRouter()

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@router.post("/upload-usage/{meter_id}")
async def upload_usage_data(meter_id: int, file: UploadFile = File(...)):
    """Upload CSV File"""
    file_path = f"{UPLOAD_FOLDER}/meter_{meter_id}_history.csv"
    
    with open(file_path, "wb") as f:
        f.write(file.file.read())

    return {"message": "File uploaded successfully"}

@router.get("/predict-usage/{meter_id}")
def predict_usage(meter_id: int):
    """Predict multiple forecasts for a meter"""
    file_path = f"{UPLOAD_FOLDER}/meter_{meter_id}_history.csv"
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=400, detail="Meter data not found. Upload CSV first.")

    result = train_and_predict(meter_id, file_path)

    return {
        "meter_id": meter_id,
        "forecasts": result["forecasts"],
        "graph_urls": result["graph_urls"]
    }
