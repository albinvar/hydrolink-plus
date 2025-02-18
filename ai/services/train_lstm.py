import os
import pandas as pd
import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt
from sklearn.preprocessing import MinMaxScaler

MODEL_FOLDER = "models/user_models"
IMAGE_FOLDER = "static/forecast_graphs"
os.makedirs(MODEL_FOLDER, exist_ok=True)
os.makedirs(IMAGE_FOLDER, exist_ok=True)

def train_and_predict(user_id: int, file_path: str):
    """Train LSTM model using user's historical water usage data and generate multiple forecasts"""
    
    # Load user data
    df = pd.read_csv(file_path)

    # Convert Date column
    df['Date'] = pd.to_datetime(df['Date'], dayfirst=True, errors='coerce')
    df.rename(columns={'Date': 'ds', 'Value': 'y'}, inplace=True)

    # Handle missing values
    df = df.dropna(subset=['y'])

    # Create lag features
    df['y_lag1'] = df['y'].shift(1)
    df['y_lag7'] = df['y'].shift(7)
    df['y_roll_mean_7'] = df['y'].rolling(window=7).mean()
    df['day_of_week'] = df['ds'].dt.dayofweek
    df['is_weekend'] = (df['ds'].dt.weekday >= 5).astype(int)

    df = df.dropna()

    features = ['y_lag1', 'y_lag7', 'y_roll_mean_7', 'day_of_week', 'is_weekend']

    # Scale features and target
    feature_scaler = MinMaxScaler()
    target_scaler = MinMaxScaler()

    scaled_features = feature_scaler.fit_transform(df[features])
    scaled_target = target_scaler.fit_transform(df[['y']])

    # Create sequences
    def create_sequences(data, seq_length):
        X, y = [], []
        for i in range(seq_length, len(data)):
            X.append(data[i - seq_length:i, :-1])
            y.append(data[i, -1])
        return np.array(X), np.array(y)

    seq_length = 14  # Two weeks
    scaled_data = np.hstack((scaled_features, scaled_target))
    X, y = create_sequences(scaled_data, seq_length)

    # Train/test split
    X_train, X_test = X[:-30], X[-30:]
    y_train, y_test = y[:-30], y[-30:]

    # Build LSTM model
    model = tf.keras.Sequential([
        tf.keras.layers.LSTM(50, activation='relu', input_shape=(X_train.shape[1], X_train.shape[2])),
        tf.keras.layers.Dense(1)
    ])

    model.compile(optimizer='adam', loss='mse')

    # Train model
    model.fit(X_train, y_train, epochs=50, batch_size=32, verbose=1)

    # Save model
    model_path = f"{MODEL_FOLDER}/user_{user_id}_lstm.h5"
    model.save(model_path)

    # Function to generate future predictions
    def generate_forecast(days):
        X_input = X_test[-1:]  # Last known data
        predictions = []
        for _ in range(days):
            pred = model.predict(X_input)[0][0]
            predictions.append(pred)
            X_input = np.roll(X_input, shift=-1, axis=1)
            X_input[0, -1, 0] = pred  # Update with predicted value
        return target_scaler.inverse_transform(np.array(predictions).reshape(-1, 1)).flatten().tolist()

    # Generate forecasts
    forecasts = {
        "30_days": generate_forecast(30),
        "90_days": generate_forecast(90),
        "180_days": generate_forecast(180),
        "365_days": generate_forecast(365),
    }

    # Generate and save graphs
    graph_urls = {}
    for period, values in forecasts.items():
        img_path = f"{IMAGE_FOLDER}/user_{user_id}_{period}_forecast.png"
        plt.figure(figsize=(10, 5))
        plt.plot(range(len(values)), values, marker='o', linestyle='-', label=f"{period.replace('_', ' ').title()} Forecast")
        plt.xlabel("Days Ahead")
        plt.ylabel("Water Usage (Liters)")
        plt.title(f"Water Usage Forecast for {period.replace('_', ' ')}")
        plt.legend()
        plt.grid()
        plt.savefig(img_path)
        plt.close()
        graph_urls[period] = f"http://127.0.0.1:8000/static/forecast_graphs/user_{user_id}_{period}_forecast.png"

    return {
        "forecasts": forecasts,
        "graph_urls": graph_urls
    }
