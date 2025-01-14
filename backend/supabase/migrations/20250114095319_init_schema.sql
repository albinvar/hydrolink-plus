-- Create devices table
CREATE TABLE devices (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL UNIQUE,
    secret_key VARCHAR(100) NOT NULL,
    registered_at TIMESTAMP DEFAULT NOW(),
    last_online TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create sensor_data table
CREATE TABLE sensor_data (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(50) REFERENCES devices(device_id) ON DELETE CASCADE,
    temperature FLOAT,
    flow_rate FLOAT,
    timestamp TIMESTAMP DEFAULT NOW()
);
