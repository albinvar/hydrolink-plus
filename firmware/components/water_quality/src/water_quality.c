#include "water_quality.h"
#include "esp_adc/adc_oneshot.h"
#include "esp_log.h"
#include "parson.h"

static const char *TAG = "WATER_QUALITY";
static adc_oneshot_unit_handle_t adc_handle = NULL;  // ✅ Initialize to NULL

/**
 * ✅ Initialize ADC for Water Quality Sensors
 */
void water_quality_adc_init() {
    if (adc_handle != NULL) {
        ESP_LOGW(TAG, "⚠️ ADC Already Initialized! Skipping...");
        return;  // ✅ Prevent re-initialization
    }

    adc_oneshot_unit_init_cfg_t init_config = {
        .unit_id = ADC_UNIT_1,
    };
    ESP_ERROR_CHECK(adc_oneshot_new_unit(&init_config, &adc_handle));

    adc_oneshot_chan_cfg_t config = {
        .atten = ADC_ATTEN_DB_12,  // ✅ 0-3.3V range
        .bitwidth = ADC_BITWIDTH_12,
    };

    ESP_ERROR_CHECK(adc_oneshot_config_channel(adc_handle, PH_SENSOR_CHANNEL, &config));

    ESP_LOGI(TAG, "✅ Water Quality ADC Initialized (pH Sensor on GPIO 35)");
}


/**
 * ✅ Read pH Sensor Data (from GPIO 35)
 */
float read_ph_sensor() {
    if (adc_handle == NULL) {
        ESP_LOGE(TAG, "❌ ADC Handle is NULL! Did you call water_quality_adc_init()?");
        return 0.0;  // Prevent crash
    }

    int raw_value = 0;
    ESP_ERROR_CHECK(adc_oneshot_read(adc_handle, PH_SENSOR_CHANNEL, &raw_value));

    // ✅ Convert raw ADC value to pH (adjust scaling based on calibration)
    float voltage = raw_value * (3.3 / 4095.0);  // Convert ADC value to voltage
    float ph_value = 3.5 * voltage;  // Approximate pH formula

    ESP_LOGI(TAG, "📊 pH Sensor Raw: %d, Voltage: %.2fV, pH: %.2f", raw_value, voltage, ph_value);
    return ph_value;
}


/**
 * ✅ Read and Format Water Quality Data
 */
void water_quality_read(water_quality_data_t *data) {
    data->ph_raw = (int)(read_ph_sensor() * 100);  // Convert pH to scaled integer
    data->conductivity_raw = 1500;  // ✅ Mock Conductivity (for now)
    data->turbidity_raw = 25;  // ✅ Mock Turbidity (for now)
    data->temperature_raw = 248;  // ✅ Mock Temperature (for now)

    ESP_LOGI(TAG, "📊 Water Quality Readings -> pH: %.2f, Conductivity: %d, Turbidity: %d, Temperature: %d",
             data->ph_raw / 100.0, data->conductivity_raw, data->turbidity_raw, data->temperature_raw);
}


/**
 * ✅ Convert Water Quality Data to JSON
 */
char* water_quality_to_json(water_quality_data_t *data) {
    JSON_Value *root_value = json_value_init_object();
    JSON_Object *root_object = json_value_get_object(root_value);
    json_object_set_string(root_object, "type", "water_quality_results");

    JSON_Value *payload_value = json_value_init_object();
    JSON_Object *payload_object = json_value_get_object(payload_value);
    json_object_set_string(payload_object, "deviceId", DEVICE_ID);
    json_object_set_number(payload_object, "ph", data->ph_raw / 100.0);
    json_object_set_number(payload_object, "conductivity", data->conductivity_raw);
    json_object_set_number(payload_object, "turbidity", data->turbidity_raw / 10.0);
    json_object_set_number(payload_object, "temperature", data->temperature_raw / 10.0);
    json_object_set_string(payload_object, "status", "Safe");

    json_object_set_value(root_object, "payload", payload_value);
    char *json_string = json_serialize_to_string(root_value);

    json_value_free(root_value);
    return json_string;
}
