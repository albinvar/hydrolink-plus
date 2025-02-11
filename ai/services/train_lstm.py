import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.preprocessing import MinMaxScaler
import os

MODEL_FOLDER = "models/user_models"
os.makedirs(MODEL_FOLDER, exist_ok=True)

def train_and_predict(user_id: int, file_path: str):
    """Train LSTM model using user's historical water usage data and forecast next 30 days"""

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

    # Create rolling mean features
    df['y_roll_mean_7'] = df['y'].rolling(window=7).mean()

    # Additional features
    df['day_of_week'] = df['ds'].dt.dayofweek
    df['is_weekend'] = (df['ds'].dt.weekday >= 5).astype(int)

    # Drop NaN values
    df = df.dropna()

    features = ['y_lag1', 'y_lag7', 'y_roll_mean_7', 'day_of_week', 'is_weekend']
    
    # Scale features and target separately
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

    # Train/test split (last 30 days for testing)
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

    # Save trained model
    model_path = f"{MODEL_FOLDER}/user_{user_id}_lstm.h5"
    model.save(model_path)

    # Predict future usage
    y_pred = model.predict(X_test)
    y_pred_inv = target_scaler.inverse_transform(y_pred)

    return y_pred_inv.flatten().tolist()
