#include "esp_websocket_client.h"
#include "esp_log.h"
#include "parson.h"
#include "ota_update.h"
#include "led_control.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "water_quality.h"
#include "driver/gpio.h"  // ✅ Add GPIO Control

// Manually include the missing headers:
#include "esp_chip_info.h"
#include "esp_flash.h"
#include "esp_app_desc.h"
#include "esp_idf_version.h"  // Required to call esp_get_idf_version()

static const char *TAG = "WEBSOCKET";

#define WEBSOCKET_URL "ws://hlp.albinvar.in"
#define DEVICE_ID "HLP001"
#define SECRET_KEY "5a3a6ac53ad64537"
#define VALVE_GPIO_PIN 18  // ✅ GPIO for Electromechanical Valve

static esp_websocket_client_handle_t client = NULL;
static bool is_authenticated = false;

/**
 * ✅ Initialize Valve GPIO
 */
void valve_init(void) {
    gpio_config_t io_conf = {
        .pin_bit_mask = (1ULL << VALVE_GPIO_PIN),
        .mode = GPIO_MODE_OUTPUT,
        .pull_up_en = GPIO_PULLUP_DISABLE,
        .pull_down_en = GPIO_PULLDOWN_DISABLE,
        .intr_type = GPIO_INTR_DISABLE
    };
    gpio_config(&io_conf);
    gpio_set_level(VALVE_GPIO_PIN, 0); // Ensure valve is OFF at startup
}

/**
 * ✅ Handles WebSocket events
 */
static void websocket_event_handler(void *arg, esp_event_base_t event_base, int32_t event_id, void *event_data) {
    esp_websocket_event_data_t *data = (esp_websocket_event_data_t *)event_data;

    switch (event_id) {
        case WEBSOCKET_EVENT_CONNECTED:
            ESP_LOGI(TAG, "✅ WebSocket Connected");
            led_set_status(LED_STATUS_WS_DISCONNECTED);

            if (!is_authenticated) {
                ESP_LOGI(TAG, "🔑 Sending Authentication Request...");
                JSON_Value *root_value = json_value_init_object();
                JSON_Object *root_object = json_value_get_object(root_value);
                json_object_set_string(root_object, "type", "authenticate");

                JSON_Value *payload_value = json_value_init_object();
                JSON_Object *payload_object = json_value_get_object(payload_value);
                json_object_set_string(payload_object, "deviceId", DEVICE_ID);
                json_object_set_string(payload_object, "secret_key", SECRET_KEY);
                json_object_set_value(root_object, "payload", payload_value);

                char *auth_message = json_serialize_to_string(root_value);
                esp_websocket_client_send_text(client, auth_message, strlen(auth_message), portMAX_DELAY);

                json_free_serialized_string(auth_message);
                json_value_free(root_value);
            }
            break;

        case WEBSOCKET_EVENT_DATA:
            if (!is_authenticated && strstr((char *)data->data_ptr, "\"auth_ack\"")) {
                ESP_LOGI(TAG, "✅ Authentication Succeeded");
                is_authenticated = true;
                led_set_status(LED_STATUS_CONNECTED);
            }

            // ✅ Respond to heartbeat request from the server
            if (strstr((char *)data->data_ptr, "\"type\":\"heartbeat_request\"")) {
                ESP_LOGI(TAG, "🔄 Received Heartbeat Request from Server, Sending Response...");
                const char *heartbeat_reply = "{\"type\":\"heartbeat_response\"}";
                esp_websocket_client_send_text(client, heartbeat_reply, strlen(heartbeat_reply), portMAX_DELAY);
            }

            // ✅ Handle OTA Command
            if (strstr((char *)data->data_ptr, "\"type\":\"ota\"")) {
                led_set_status(LED_STATUS_OTA_IN_PROGRESS);
                ESP_LOGI(TAG, "📦 Received OTA command");

                // Parse incoming JSON
                JSON_Value *root_val = json_parse_string((const char *)data->data_ptr);
                if (!root_val) {
                    ESP_LOGE(TAG, "Failed to parse OTA JSON");
                    break;
                }

                JSON_Object *root_obj = json_value_get_object(root_val);
                JSON_Object *payload = json_object_get_object(root_obj, "payload");

                if (!payload) {
                    ESP_LOGE(TAG, "OTA payload missing");
                    json_value_free(root_val);
                    break;
                }

                const char *url = json_object_get_string(payload, "url");
                if (url) {
                    ESP_LOGI(TAG, "🌐 Starting OTA from URL: %s", url);
                    ota_start(url);  // This will reboot if successful
                } else {
                    ESP_LOGE(TAG, "OTA URL not provided in payload");
                }

                json_value_free(root_val);
            }

            // ✅ Handle Water Quality Requests
            if (strstr((char *)data->data_ptr, "\"type\":\"get_water_quality_results\"")) {
                ESP_LOGI(TAG, "💧 Received Water Quality Request, Sending Real Data...");
                water_quality_data_t sensor_data;
                water_quality_read(&sensor_data);
                char *json_data = water_quality_to_json(&sensor_data);
                esp_websocket_client_send_text(client, json_data, strlen(json_data), portMAX_DELAY);
                free(json_data);
            }

            // ✅ Handle Valve Control Commands
            if (strstr((char *)data->data_ptr, "\"type\":\"open_valve\"")) {
                ESP_LOGI(TAG, "🚰 Received Command: OPEN VALVE");
                gpio_set_level(VALVE_GPIO_PIN, 1); // Turn Valve ON

                // Send Confirmation Response
                JSON_Value *response_value = json_value_init_object();
                JSON_Object *response_object = json_value_get_object(response_value);
                json_object_set_string(response_object, "type", "command_response");
                json_object_set_string(response_object, "deviceId", DEVICE_ID);
                json_object_set_string(response_object, "status", "Valve Opened");

                char *response_message = json_serialize_to_string(response_value);
                esp_websocket_client_send_text(client, response_message, strlen(response_message), portMAX_DELAY);

                json_free_serialized_string(response_message);
                json_value_free(response_value);
            }

            if (strstr((char *)data->data_ptr, "\"type\":\"close_valve\"")) {
                ESP_LOGI(TAG, "🚰 Received Command: CLOSE VALVE");
                gpio_set_level(VALVE_GPIO_PIN, 0); // Turn Valve OFF

                // Send Confirmation Response
                JSON_Value *response_value = json_value_init_object();
                JSON_Object *response_object = json_value_get_object(response_value);
                json_object_set_string(response_object, "type", "command_response");
                json_object_set_string(response_object, "deviceId", DEVICE_ID);
                json_object_set_string(response_object, "status", "Valve Closed");

                char *response_message = json_serialize_to_string(response_value);
                esp_websocket_client_send_text(client, response_message, strlen(response_message), portMAX_DELAY);

                json_free_serialized_string(response_message);
                json_value_free(response_value);
            }

            // ✅ Handle "get_device_info" command to retrieve core details
            if (strstr((char *)data->data_ptr, "\"type\":\"get_device_info\"")) {
                ESP_LOGI(TAG, "📦 Received Command: GET DEVICE INFO");

                esp_chip_info_t chip_info;
                esp_chip_info(&chip_info);

                uint32_t flash_size = 0;
                esp_flash_get_size(NULL, &flash_size);

                const esp_app_desc_t *app_desc = esp_app_get_description();

                // Create a JSON object with a nested payload for device info
                JSON_Value *info_value = json_value_init_object();
                JSON_Object *info_obj = json_value_get_object(info_value);

                // Set the response type
                json_object_set_string(info_obj, "type", "device_info_response");

                // Create a payload object with the device details
                JSON_Value *payload_value = json_value_init_object();
                JSON_Object *payload_obj = json_value_get_object(payload_value);

                json_object_set_string(payload_obj, "deviceId", DEVICE_ID);
                json_object_set_string(payload_obj, "chip_model", "ESP32");
                json_object_set_number(payload_obj, "chip_revision", chip_info.revision);
                json_object_set_number(payload_obj, "cores", chip_info.cores);
                json_object_set_number(payload_obj, "flash_size_MB", flash_size / (1024 * 1024));
                json_object_set_string(payload_obj, "idf_version", esp_get_idf_version());
                json_object_set_string(payload_obj, "app_version", app_desc->version);

                // Nest the payload inside the main object
                json_object_set_value(info_obj, "payload", payload_value);

                char *info_str = json_serialize_to_string(info_value);
                ESP_LOGI(TAG, "Sending device info: %s", info_str);
                esp_websocket_client_send_text(client, info_str, strlen(info_str), portMAX_DELAY);

                json_free_serialized_string(info_str);
                json_value_free(info_value);
            }


            break;

        case WEBSOCKET_EVENT_DISCONNECTED:
            ESP_LOGW(TAG, "⚠️ WebSocket Disconnected");
            is_authenticated = false;
            led_set_status(LED_STATUS_WS_DISCONNECTED);
            break;

        case WEBSOCKET_EVENT_ERROR:
            ESP_LOGE(TAG, "❌ WebSocket Error Occurred");
            is_authenticated = false;
            led_set_status(LED_STATUS_WS_DISCONNECTED);
            break;

        default:
            ESP_LOGW(TAG, "⚠️ Unhandled WebSocket event: %" PRId32, event_id);
            break;
    }
}

/**
 * ✅ Initializes WebSocket client
 */
void websocket_init(void) {
    valve_init();  // Initialize valve GPIO

    esp_websocket_client_config_t websocket_cfg = {
        .uri = WEBSOCKET_URL,
    };

    client = esp_websocket_client_init(&websocket_cfg);
    esp_websocket_register_events(client, WEBSOCKET_EVENT_ANY, websocket_event_handler, NULL);

    ESP_LOGI(TAG, "🌐 Connecting to WebSocket server...");
    esp_websocket_client_start(client);
}

/**
 * ✅ Broadcast a message over WebSocket
 */
void websocket_broadcast(const char *message) {
    if (client != NULL && esp_websocket_client_is_connected(client)) {
        esp_websocket_client_send_text(client, message, strlen(message), portMAX_DELAY);
        ESP_LOGI(TAG, "📢 WebSocket broadcasted: %s", message);
    } else {
        ESP_LOGW(TAG, "⚠️ WebSocket not connected. Message not sent: %s", message);
    }
}
