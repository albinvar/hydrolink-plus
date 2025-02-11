# from fastapi import APIRouter
# import joblib
# import numpy as np

# router = APIRouter()

# # Load model
# svm_model = joblib.load("models/svm_leak_detection.pkl")

# @router.post("/detect-leak")
# def detect_leak(water_flow: float):
#     input_data = np.array([[water_flow]])
#     leak_status = svm_model.predict(input_data)[0]
#     return {"leak_status": "Leak Detected" if leak_status == -1 else "No Leak"}
