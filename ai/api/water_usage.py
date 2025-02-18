from fastapi import APIRouter, UploadFile, File, HTTPException
import os
import pandas as pd
from services.train_lstm import train_and_predict

router = APIRouter()

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@router.post("/upload-usage/{user_id}")
async def upload_usage_data(user_id: int, file: UploadFile = File(...)):
    """Upload CSV File"""
    file_path = f"{UPLOAD_FOLDER}/user_{user_id}_history.csv"
    
    with open(file_path, "wb") as f:
        f.write(file.file.read())

    return {"message": "File uploaded successfully"}

@router.get("/predict-usage/{user_id}")
def predict_usage(user_id: int):
    """Predict multiple forecasts for user"""
    file_path = f"{UPLOAD_FOLDER}/user_{user_id}_history.csv"
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=400, detail="User data not found. Upload CSV first.")

    result = train_and_predict(user_id, file_path)

    return {
        "user_id": user_id,
        "forecasts": result["forecasts"],
        "graph_urls": result["graph_urls"]
    }
