#include "water_quality.h"
#include "esp_adc/adc_oneshot.h"
#include "esp_log.h"
#include "parson.h"

static const char *TAG = "WATER_QUALITY";
static adc_oneshot_unit_handle_t adc_handle;

/**
 * ✅ Initialize ADC Channels
 */
void water_quality_adc_init() {
    adc_oneshot_unit_init_cfg_t init_config = {
        .unit_id = ADC_UNIT_1,
    };
    adc_oneshot_new_unit(&init_config, &adc_handle);

    adc_oneshot_chan_cfg_t config = {
        .atten = ADC_ATTEN_DB_12, // ✅ FIX: Replaced deprecated ADC_ATTEN_DB_11
        .bitwidth = ADC_BITWIDTH_12,
    };

    // adc_oneshot_config_channel(adc_handle, PH_SENSOR_CHANNEL, &config);
    // adc_oneshot_config_channel(adc_handle, CONDUCTIVITY_SENSOR_CHANNEL, &config);
    // adc_oneshot_config_channel(adc_handle, TURBIDITY_SENSOR_CHANNEL, &config);
    // adc_oneshot_config_channel(adc_handle, TEMPERATURE_SENSOR_CHANNEL, &config);

    ESP_LOGI(TAG, "✅ Water Quality ADC Initialized");
}


/**
 * ✅ Read ADC Value
 */
static int read_sensor(uint8_t channel) {
    int raw_value = 0;
    adc_oneshot_read(adc_handle, channel, &raw_value);
    return raw_value;
}

// /**
//  * ✅ Read Water Quality Data
//  */
// void water_quality_read(water_quality_data_t *data) {
//     data->ph_raw = read_sensor(PH_SENSOR_CHANNEL);
//     data->conductivity_raw = read_sensor(CONDUCTIVITY_SENSOR_CHANNEL);
//     data->turbidity_raw = read_sensor(TURBIDITY_SENSOR_CHANNEL);
//     data->temperature_raw = read_sensor(TEMPERATURE_SENSOR_CHANNEL);

//     ESP_LOGI(TAG, "💧 Water Quality Readings: pH Raw=%d, Cond Raw=%d, Turb Raw=%d, Temp Raw=%d",
//              data->ph_raw, data->conductivity_raw, data->turbidity_raw, data->temperature_raw);
// }

void water_quality_read(water_quality_data_t *data) {
    // ✅ Use Hardcoded Mock Values Instead of ADC
    data->ph_raw = 720;               // Mock pH value (7.2 in scaled form)
    data->conductivity_raw = 1500;     // Mock Conductivity (1500 µS/cm)
    data->turbidity_raw = 25;          // Mock Turbidity (2.5 NTU)
    data->temperature_raw = 248;       // Mock Temperature (24.8°C in scaled form)

    ESP_LOGI(TAG, "📊 Water Quality Readings -> pH: %d, Conductivity: %d, Turbidity: %d, Temperature: %d",
             data->ph_raw, data->conductivity_raw, data->turbidity_raw, data->temperature_raw);
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
    json_object_set_number(payload_object, "turbidity", data->turbidity_raw / 100.0);
    json_object_set_number(payload_object, "temperature", data->temperature_raw / 100.0);
    json_object_set_string(payload_object, "status", "Safe");

    json_object_set_value(root_object, "payload", payload_value);
    char *json_string = json_serialize_to_string(root_value);

    json_value_free(root_value);
    return json_string;
}
