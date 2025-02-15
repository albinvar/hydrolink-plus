#include "water_quality.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_adc/adc_oneshot.h"
#include "esp_log.h"
#include "parson.h"
#include <stdlib.h>

static const char *TAG = "WATER_QUALITY";
static adc_oneshot_unit_handle_t adc_handle = NULL;

// Use 10 samples and average the middle 6 values for noise reduction.
#define NUM_SAMPLES 10

// Use 30 samples for the TDS sensor with median filtering.
#define TDS_NUM_SAMPLES 30

// ADC channels (make sure these match your wiring)
#define PH_SENSOR_CHANNEL         ADC_CHANNEL_7   // e.g., GPIO35
#define TURBIDITY_SENSOR_CHANNEL  ADC_CHANNEL_6   // e.g., GPIO34
#define TDS_SENSOR_CHANNEL        ADC_CHANNEL_4   // D32 (e.g., GPIO32)

// Calibration/constants (adjust these after calibrating your sensors)
#define PH_CALIBRATION_OFFSET 0.12f    // Adjust so that pH 7 solution gives ~7.0
#define TURBIDITY_VCLEAR      2.8f     // (Volts) Sensor output (at 5V scale) in clear water

/**
 * @brief Initialize ADC channels for water quality sensors.
 *
 * The sensors are assumed to be powered at 5V and their outputs scaled down
 * (via a resistor divider) so that the ESP32 ADC (3.3V max) is not overdriven.
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
        .atten    = ADC_ATTEN_DB_12,  // 0–3.3V range on ESP32
        .bitwidth = ADC_BITWIDTH_12,
    };

    ESP_ERROR_CHECK(adc_oneshot_config_channel(adc_handle, PH_SENSOR_CHANNEL, &config));
    ESP_ERROR_CHECK(adc_oneshot_config_channel(adc_handle, TURBIDITY_SENSOR_CHANNEL, &config));
    ESP_ERROR_CHECK(adc_oneshot_config_channel(adc_handle, TDS_SENSOR_CHANNEL, &config));

    ESP_LOGI(TAG, "Water Quality ADC Initialized (pH on GPIO35, Turbidity on GPIO34, TDS on GPIO32)");
}

/**
 * @brief Helper: sort an integer array (used for median filtering)
 */
static int compare_int(const void *a, const void *b) {
    int ia = *(const int*)a;
    int ib = *(const int*)b;
    return ia - ib;
}

/**
 * @brief Read the pH sensor.
 *
 * Samples the ADC NUM_SAMPLES times, sorts the readings, and averages the middle
 * six values to reduce noise. Then, converts the ADC reading into the sensor’s
 * output voltage (undoing the voltage divider) and applies the conversion:
 *
 *     pH = 3.5 × (sensor_voltage) + PH_CALIBRATION_OFFSET
 *
 * @return float pH value.
 */
float read_ph_sensor() {
    if (adc_handle == NULL) {
        ESP_LOGE(TAG, "ADC not initialized! Call water_quality_adc_init() first.");
        return 0.0f;
    }
    int samples[NUM_SAMPLES] = {0};

    for (int i = 0; i < NUM_SAMPLES; i++) {
        ESP_ERROR_CHECK(adc_oneshot_read(adc_handle, PH_SENSOR_CHANNEL, &samples[i]));
        vTaskDelay(pdMS_TO_TICKS(10));
    }

    // Sort the sample array
    qsort(samples, NUM_SAMPLES, sizeof(int), compare_int);

    // Average the middle 6 values (indices 2 to 7)
    int sum = 0;
    for (int i = 2; i < 8; i++) {
        sum += samples[i];
    }
    float avg_adc = sum / 6.0f;

    // Convert ADC reading (0–4095) to voltage at the ADC pin (0–3.3V)
    float adc_voltage = avg_adc * (3.3f / 4095.0f);
    // Undo the voltage divider: recover sensor’s actual output (0–5V)
    float sensor_voltage = adc_voltage * (5.0f / 3.3f);
    // Convert sensor voltage to pH using the sensor’s transfer function
    float ph = 3.5f * sensor_voltage + PH_CALIBRATION_OFFSET;

    ESP_LOGI(TAG, "pH Sensor: Raw avg=%d, ADC=%.2fV, Sensor=%.2fV, pH=%.2f",
             (int)avg_adc, adc_voltage, sensor_voltage, ph);
    return ph;
}

/**
 * @brief Read the turbidity sensor.
 *
 * Samples the ADC NUM_SAMPLES times, sorts the values, and averages the middle six.
 * Then converts the reading to a voltage (undoing the voltage divider). A linear mapping
 * is assumed:
 *
 *     - In clear water: sensor voltage ≈ TURBIDITY_VCLEAR → 0 NTU.
 *     - In very turbid water: sensor voltage → 0 V → 1000 NTU.
 *
 * @return float turbidity in NTU.
 */
float read_turbidity_sensor() {
    if (adc_handle == NULL) {
        ESP_LOGE(TAG, "ADC not initialized! Call water_quality_adc_init() first.");
        return 0.0f;
    }
    int samples[NUM_SAMPLES] = {0};

    for (int i = 0; i < NUM_SAMPLES; i++) {
        ESP_ERROR_CHECK(adc_oneshot_read(adc_handle, TURBIDITY_SENSOR_CHANNEL, &samples[i]));
        vTaskDelay(pdMS_TO_TICKS(10));
    }

    qsort(samples, NUM_SAMPLES, sizeof(int), compare_int);

    int sum = 0;
    for (int i = 2; i < 8; i++) {
        sum += samples[i];
    }
    float avg_adc = sum / 6.0f;
    float adc_voltage = avg_adc * (3.3f / 4095.0f);
    float sensor_voltage = adc_voltage * (5.0f / 3.3f);

    float ntu = 0.0f;
    if (sensor_voltage >= TURBIDITY_VCLEAR) {
        ntu = 0.0f;
    } else {
        ntu = ((TURBIDITY_VCLEAR - sensor_voltage) / TURBIDITY_VCLEAR) * 1000.0f;
    }

    ESP_LOGI(TAG, "Turbidity Sensor: Raw avg=%d, ADC=%.2fV, Sensor=%.2fV, NTU=%.2f",
             (int)avg_adc, adc_voltage, sensor_voltage, ntu);
    return ntu;
}

/**
 * @brief Read the TDS sensor.
 *
 * Samples the ADC TDS_NUM_SAMPLES times, applies median filtering, and converts the
 * ADC value into a voltage (after undoing the voltage divider). Then, using a temperature
 * compensation formula and a third-order polynomial, it calculates the TDS in ppm.
 *
 * @return float TDS value in ppm.
 */
float read_tds_sensor() {
    if (adc_handle == NULL) {
        ESP_LOGE(TAG, "ADC not initialized! Call water_quality_adc_init() first.");
        return 0.0f;
    }
    int samples[TDS_NUM_SAMPLES] = {0};

    for (int i = 0; i < TDS_NUM_SAMPLES; i++) {
        ESP_ERROR_CHECK(adc_oneshot_read(adc_handle, TDS_SENSOR_CHANNEL, &samples[i]));
        vTaskDelay(pdMS_TO_TICKS(10));
    }

    // Sort the samples array for median filtering
    qsort(samples, TDS_NUM_SAMPLES, sizeof(int), compare_int);

    // Compute the median value.
    float median_adc;
    if (TDS_NUM_SAMPLES % 2 == 0) {
        median_adc = (samples[TDS_NUM_SAMPLES/2 - 1] + samples[TDS_NUM_SAMPLES/2]) / 2.0f;
    } else {
        median_adc = samples[TDS_NUM_SAMPLES/2];
    }

    // Convert ADC reading (0–4095) to voltage at the ADC pin (0–3.3V)
    float adc_voltage = median_adc * (3.3f / 4095.0f);
    // Undo the voltage divider: recover sensor’s actual output (0–5V)
    float sensor_voltage = adc_voltage * (5.0f / 3.3f);

    // Temperature compensation.
    // Use a default temperature of 25°C (modify as needed if you have a temperature sensor).
    float temperature = 25.0f;
    float compensation_coefficient = 1.0f + 0.02f * (temperature - 25.0f);
    float compensation_voltage = sensor_voltage / compensation_coefficient;

    // Convert the compensated voltage to TDS (ppm) using the sensor’s polynomial conversion.
    float tds = (133.42f * compensation_voltage * compensation_voltage * compensation_voltage
                 - 255.86f * compensation_voltage * compensation_voltage
                 + 857.39f * compensation_voltage) * 0.5f;

    ESP_LOGI(TAG, "TDS Sensor: Raw median=%d, ADC=%.2fV, Sensor=%.2fV, Compensated=%.2fV, TDS=%.0fppm",
             samples[TDS_NUM_SAMPLES/2], adc_voltage, sensor_voltage, compensation_voltage, tds);

    return tds;
}

/**
 * @brief Read all water quality sensor data.
 *
 * Fills in the water_quality_data_t structure. (Conductivity and temperature are
 * still placeholders for now.)
 */
void water_quality_read(water_quality_data_t *data) {
    float ph = read_ph_sensor();
    float turbidity = read_turbidity_sensor();
    float tds = read_tds_sensor();

    // Scale pH to a fixed-point integer (pH*100) for transmission.
    data->ph_raw = (int)(ph * 100);
    // Turbidity is already in NTU (0–1000 range)
    data->turbidity_raw = (int) turbidity;
    // TDS in ppm
    data->tds_raw = (int) tds;
    // These values are placeholders.
    data->conductivity_raw = 1500;
    data->temperature_raw = 248;

    ESP_LOGI(TAG, "Water Quality: pH=%.2f, Turbidity=%.1f NTU, TDS=%d ppm, Conductivity=%d, Temperature=%.1f°C",
             ph, turbidity, data->tds_raw, data->conductivity_raw, data->temperature_raw / 10.0f);
}

/**
 * @brief Convert water quality data to JSON.
 */
char* water_quality_to_json(water_quality_data_t *data) {
    JSON_Value *root_value = json_value_init_object();
    JSON_Object *root_object = json_value_get_object(root_value);
    json_object_set_string(root_object, "type", "water_quality_results");

    JSON_Value *payload_value = json_value_init_object();
    JSON_Object *payload_object = json_value_get_object(payload_value);
    json_object_set_string(payload_object, "deviceId", DEVICE_ID);
    json_object_set_number(payload_object, "ph", data->ph_raw / 100.0);
    json_object_set_number(payload_object, "turbidity", data->turbidity_raw);
    json_object_set_number(payload_object, "tds", data->tds_raw);
    json_object_set_number(payload_object, "conductivity", data->conductivity_raw);
    json_object_set_number(payload_object, "temperature", data->temperature_raw / 10.0);
    json_object_set_string(payload_object, "status", "Safe");

    json_object_set_value(root_object, "payload", payload_value);
    char *json_string = json_serialize_to_string(root_value);
    json_value_free(root_value);
    return json_string;
}
