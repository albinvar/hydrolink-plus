from fastapi import APIRouter, UploadFile, File, HTTPException
import os
import pandas as pd
from services.train_lstm import train_and_predict

router = APIRouter()

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@router.post("/upload-usage/{user_id}")
async def upload_usage_data(user_id: int, file: UploadFile = File(...)):
    """Endpoint to upload a user's water usage history CSV"""
    file_path = f"{UPLOAD_FOLDER}/user_{user_id}_history.csv"
    
    with open(file_path, "wb") as f:
        f.write(file.file.read())

    return {"message": "File uploaded successfully"}

@router.get("/predict-usage/{user_id}")
def predict_usage(user_id: int):
    """Train model on user's data and predict next 30 days"""
    file_path = f"{UPLOAD_FOLDER}/user_{user_id}_history.csv"
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=400, detail="User data not found. Upload CSV first.")

    forecasted_data = train_and_predict(user_id, file_path)

    return {
        "user_id": user_id,
        "forecasted_usage": forecasted_data["forecasted_usage"],
        "graph_url": forecasted_data["graph_url"]
    }
