#include "water_quality.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_adc/adc_oneshot.h"
#include "esp_log.h"
#include "parson.h"

// Sampling configuration: sample every 100 ms over 10 seconds (100 samples)
#define SAMPLING_INTERVAL_MS   100
#define SAMPLING_DURATION_MS   10000
#define NUM_SAMPLES            (SAMPLING_DURATION_MS / SAMPLING_INTERVAL_MS)  // 100 samples

// Define sensor ports (and associated ADC channels)
#define PH_SENSOR_GPIO             35
#define PH_SENSOR_ADC_CHANNEL      ADC_CHANNEL_7  // e.g., GPIO35
#define TURBIDITY_SENSOR_GPIO      34
#define TURBIDITY_SENSOR_ADC_CHANNEL ADC_CHANNEL_6 // e.g., GPIO34

// Calibration constants (adjust these after calibrating your sensors)
// For the pH sensor, the conversion is: pH = 3.5 * (sensor_voltage) + PH_CALIBRATION_OFFSET
#define PH_CALIBRATION_OFFSET      0.12f

// For the turbidity sensor, in clear water the sensor (at 5V scale)
// should output approximately TURBIDITY_VCLEAR volts.
// Then, NTU is mapped linearly: sensor_voltage == TURBIDITY_VCLEAR  →  0 NTU,
// and sensor_voltage == 0 → 1000 NTU.
#define TURBIDITY_VCLEAR           2.8f

static const char *TAG = "WATER_QUALITY";
static adc_oneshot_unit_handle_t adc_handle = NULL;

/**
 * @brief Initialize the ADC for both sensors.
 *
 * The sensors are powered at 5 V but their outputs must be scaled (with a voltage divider)
 * so that the ESP32 ADC (0–3.3 V) is not overdriven.
 */
void water_quality_adc_init() {
    if (adc_handle != NULL) {
        ESP_LOGW(TAG, "ADC already initialized; skipping.");
        return;
    }
    
    adc_oneshot_unit_init_cfg_t init_config = {
        .unit_id = ADC_UNIT_1,
    };
    ESP_ERROR_CHECK(adc_oneshot_new_unit(&init_config, &adc_handle));
    
    adc_oneshot_chan_cfg_t config = {
        .atten    = ADC_ATTEN_DB_12,  // 0–3.3 V full-scale
        .bitwidth = ADC_BITWIDTH_12,
    };
    
    ESP_ERROR_CHECK(adc_oneshot_config_channel(adc_handle, PH_SENSOR_ADC_CHANNEL, &config));
    ESP_ERROR_CHECK(adc_oneshot_config_channel(adc_handle, TURBIDITY_SENSOR_ADC_CHANNEL, &config));
    
    ESP_LOGI(TAG,
             "ADC Initialized: pH sensor on GPIO%d (ADC channel %d), Turbidity sensor on GPIO%d (ADC channel %d)",
             PH_SENSOR_GPIO, PH_SENSOR_ADC_CHANNEL, TURBIDITY_SENSOR_GPIO, TURBIDITY_SENSOR_ADC_CHANNEL);
}

/**
 * @brief Helper function for qsort.
 */
static int compare_int(const void *a, const void *b) {
    int ia = *(const int*)a;
    int ib = *(const int*)b;
    return ia - ib;
}

/**
 * @brief Read the pH sensor.
 *
 * Samples the ADC every 100 ms over a 10-second period (100 samples),
 * sorts the samples, and averages the middle 60 to reduce noise.
 * The ADC reading is converted from 0–4095 to 0–3.3 V, then "unscaled" to
 * the sensor’s 5 V domain, and finally converted into a pH value.
 *
 * @return float The calculated pH.
 */
float read_ph_sensor() {
    if (adc_handle == NULL) {
        ESP_LOGE(TAG, "ADC not initialized!");
        return 0.0f;
    }
    
    int samples[NUM_SAMPLES];
    for (int i = 0; i < NUM_SAMPLES; i++) {
        ESP_ERROR_CHECK(adc_oneshot_read(adc_handle, PH_SENSOR_ADC_CHANNEL, &samples[i]));
        vTaskDelay(pdMS_TO_TICKS(SAMPLING_INTERVAL_MS));
    }
    
    // Sort and average the middle 60 samples (discard the lowest 20 and highest 20)
    qsort(samples, NUM_SAMPLES, sizeof(int), compare_int);
    long sum = 0;
    for (int i = 20; i < 80; i++) {
        sum += samples[i];
    }
    float avg_adc = sum / 60.0f;
    
    // Convert ADC value to voltage at the ADC pin (0–3.3 V)
    float adc_voltage = avg_adc * (3.3f / 4095.0f);
    // "Unscale" the voltage: recover the sensor's actual output voltage (assumed 0–5 V)
    float sensor_voltage = adc_voltage * (5.0f / 3.3f);
    // Calculate pH (using the sensor’s transfer function)
    float ph = 3.5f * sensor_voltage + PH_CALIBRATION_OFFSET;
    
    ESP_LOGI(TAG, "pH Sensor: Raw avg=%.0f, ADC=%.2f V, Sensor=%.2f V, pH=%.2f",
             avg_adc, adc_voltage, sensor_voltage, ph);
    return ph;
}

/**
 * @brief Read the turbidity sensor.
 *
 * Samples the ADC every 100 ms over a 10-second period (100 samples),
 * sorts the samples, and averages the middle 60 values.
 * The ADC reading is converted to a voltage (0–3.3 V), then "unscaled" to
 * the sensor’s 5 V domain. A linear mapping is applied:
 *   - sensor_voltage == TURBIDITY_VCLEAR → 0 NTU (clear water)
 *   - sensor_voltage == 0 → 1000 NTU (very turbid water)
 *
 * @return float The calculated turbidity in NTU.
 */
float read_turbidity_sensor() {
    if (adc_handle == NULL) {
        ESP_LOGE(TAG, "ADC not initialized!");
        return 0.0f;
    }
    
    int samples[NUM_SAMPLES];
    for (int i = 0; i < NUM_SAMPLES; i++) {
        ESP_ERROR_CHECK(adc_oneshot_read(adc_handle, TURBIDITY_SENSOR_ADC_CHANNEL, &samples[i]));
        vTaskDelay(pdMS_TO_TICKS(SAMPLING_INTERVAL_MS));
    }
    
    qsort(samples, NUM_SAMPLES, sizeof(int), compare_int);
    long sum = 0;
    for (int i = 20; i < 80; i++) {
        sum += samples[i];
    }
    float avg_adc = sum / 60.0f;
    
    float adc_voltage = avg_adc * (3.3f / 4095.0f);
    float sensor_voltage = adc_voltage * (5.0f / 3.3f);
    
    // Map sensor_voltage to NTU (linear mapping)
    float ntu = 0.0f;
    if (sensor_voltage >= TURBIDITY_VCLEAR) {
        ntu = 0.0f;
    } else {
        ntu = ((TURBIDITY_VCLEAR - sensor_voltage) / TURBIDITY_VCLEAR) * 1000.0f;
    }
    
    ESP_LOGI(TAG, "Turbidity Sensor: Raw avg=%.0f, ADC=%.2f V, Sensor=%.2f V, NTU=%.2f",
             avg_adc, adc_voltage, sensor_voltage, ntu);
    return ntu;
}

/**
 * @brief Read all water quality sensor data.
 *
 * This function takes roughly 20 seconds total (10 sec per sensor)
 * and fills in the water_quality_data_t structure.
 */
void water_quality_read(water_quality_data_t *data) {
    // Read pH sensor (takes ~10 sec)
    float ph = read_ph_sensor();
    // Read turbidity sensor (takes ~10 sec)
    float turbidity = read_turbidity_sensor();
    
    // Scale/assign values (conductivity and temperature are placeholders)
    data->ph_raw = (int)(ph * 100);          // pH scaled by 100
    data->turbidity_raw = (int)turbidity;      // NTU value
    data->conductivity_raw = 1500;             // Placeholder
    data->temperature_raw = 248;               // Placeholder (e.g., 24.8°C)
    
    ESP_LOGI(TAG, "Water Quality: pH=%.2f, Turbidity=%.1f NTU, Conductivity=%d, Temperature=%.1f°C",
             ph, turbidity, data->conductivity_raw, data->temperature_raw / 10.0f);
}

/**
 * @brief Convert water quality data to a JSON string.
 */
char* water_quality_to_json(water_quality_data_t *data) {
    JSON_Value *root_val = json_value_init_object();
    JSON_Object *root_obj = json_value_get_object(root_val);
    json_object_set_string(root_obj, "type", "water_quality_results");
    
    JSON_Value *payload_val = json_value_init_object();
    JSON_Object *payload_obj = json_value_get_object(payload_val);
    json_object_set_string(payload_obj, "deviceId", DEVICE_ID);
    json_object_set_number(payload_obj, "ph", data->ph_raw / 100.0);
    json_object_set_number(payload_obj, "turbidity", data->turbidity_raw);
    json_object_set_number(payload_obj, "conductivity", data->conductivity_raw);
    json_object_set_number(payload_obj, "temperature", data->temperature_raw / 10.0);
    json_object_set_string(payload_obj, "status", "Safe");
    
    json_object_set_value(root_obj, "payload", payload_val);
    char *json_string = json_serialize_to_string(root_val);
    json_value_free(root_val);
    return json_string;
}
