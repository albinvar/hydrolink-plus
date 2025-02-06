#include "esp_websocket_client.h"
#include "esp_log.h"
#include "parson.h"
#include "led_control.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "water_quality.h"  // Include the new water quality component

static const char *TAG = "WEBSOCKET";

#define WEBSOCKET_URL "ws://hlp.albinvar.in"
#define DEVICE_ID "HLP001"
#define SECRET_KEY "5a3a6ac53ad64537"

static esp_websocket_client_handle_t client = NULL;
static bool is_authenticated = false;


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

            if (strstr((char *)data->data_ptr, "\"type\":\"get_water_quality_results\"")) {
                ESP_LOGI(TAG, "💧 Received Water Quality Request, Sending Real Data...");

                // ✅ Read real sensor values
                water_quality_data_t sensor_data;
                water_quality_read(&sensor_data);
                char *json_data = water_quality_to_json(&sensor_data);

                // ✅ Send to WebSocket
                esp_websocket_client_send_text(client, json_data, strlen(json_data), portMAX_DELAY);
                free(json_data);
            }

            // ✅ Respond to command request
            if (strstr((char *)data->data_ptr, "\"type\":\"command_request\"")) {
                ESP_LOGI(TAG, "🛠 Received Command Request, Sending Response...");

                JSON_Value *response_value = json_value_init_object();
                JSON_Object *response_object = json_value_get_object(response_value);
                json_object_set_string(response_object, "type", "command_response");
                json_object_set_string(response_object, "deviceId", DEVICE_ID);
                json_object_set_string(response_object, "status", "Command received and executed");

                char *response_message = json_serialize_to_string(response_value);
                esp_websocket_client_send_text(client, response_message, strlen(response_message), portMAX_DELAY);

                json_free_serialized_string(response_message);
                json_value_free(response_value);
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
    esp_websocket_client_config_t websocket_cfg = {
        .uri = WEBSOCKET_URL,
    };

    client = esp_websocket_client_init(&websocket_cfg);
    esp_websocket_register_events(client, WEBSOCKET_EVENT_ANY, websocket_event_handler, NULL);

    ESP_LOGI(TAG, "🌐 Connecting to WebSocket server...");
    esp_websocket_client_start(client);
}
