#include "esp_websocket_client.h"
#include "esp_log.h"
#include "parson.h"
#include "led_control.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

static const char *TAG = "WEBSOCKET";

#define WEBSOCKET_URL "ws://hlp.albinvar.in"
#define DEVICE_ID "HLP001"
#define SECRET_KEY "5a3a6ac53ad64537"

static esp_websocket_client_handle_t client = NULL;
static bool is_authenticated = false; // Authentication state
static bool websocket_connected = false; // WebSocket connection state

/**
 * @brief Handles WebSocket events efficiently.
 */
static void websocket_event_handler(void *arg, esp_event_base_t event_base, int32_t event_id, void *event_data) {
    esp_websocket_event_data_t *data = (esp_websocket_event_data_t *)event_data;

    switch (event_id) {
        case WEBSOCKET_EVENT_CONNECTED:
            ESP_LOGI(TAG, "✅ WebSocket Connected");
            websocket_connected = true;
            led_set_status(LED_STATUS_WS_DISCONNECTED);  // Assume disconnected until authenticated

            // Authenticate only if not already authenticated
            if (!is_authenticated) {
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

        case WEBSOCKET_EVENT_DISCONNECTED:
            ESP_LOGW(TAG, "⚠️ WebSocket Disconnected");
            websocket_connected = false;
            is_authenticated = false;
            led_set_status(LED_STATUS_WS_DISCONNECTED);
            break;

        case WEBSOCKET_EVENT_DATA:
            ESP_LOGD(TAG, "📩 WebSocket received data: %.*s", data->data_len, (char *)data->data_ptr);

            // Parse JSON response
            JSON_Value *response_value = json_parse_string((char *)data->data_ptr);
            if (response_value) {
                JSON_Object *response_object = json_value_get_object(response_value);
                const char *type = json_object_get_string(response_object, "type");

                if (type && strcmp(type, "auth_ack") == 0) {
                    bool success = json_object_get_boolean(response_object, "success");
                    if (!success) {
                        ESP_LOGE(TAG, "❌ Authentication Failed");
                        is_authenticated = false;
                        led_set_status(LED_STATUS_WS_DISCONNECTED);
                        esp_websocket_client_stop(client);
                    } else {
                        ESP_LOGI(TAG, "✅ Authentication Succeeded");
                        is_authenticated = true;
                        led_set_status(LED_STATUS_CONNECTED); // ✅ LED stays ON when authenticated
                    }
                }
                json_value_free(response_value);
            }
            break;

        case WEBSOCKET_EVENT_ERROR:
    ESP_LOGE(TAG, "🚨 WebSocket Error Occurred");
    websocket_connected = false;
    is_authenticated = false;
    led_set_status(LED_STATUS_WS_DISCONNECTED);
    break;

default:
    ESP_LOGW(TAG, "⚠️ Unhandled WebSocket event: %" PRId32, event_id);
    break;
    }
}

/**
 * @brief WebSocket Reconnection Task (Runs Independently)
 */
static void websocket_reconnect_task(void *param) {
    while (true) {
        if (!websocket_connected) {
            ESP_LOGW(TAG, "🔄 Reconnecting WebSocket...");
            esp_websocket_client_start(client);
        }
        vTaskDelay(pdMS_TO_TICKS(10000));  // Retry every 10 seconds
    }
}

/**
 * @brief Initializes WebSocket connection.
 */
void websocket_init(void) {
    esp_websocket_client_config_t websocket_cfg = {
        .uri = WEBSOCKET_URL,
    };

    client = esp_websocket_client_init(&websocket_cfg);
    esp_websocket_register_events(client, WEBSOCKET_EVENT_ANY, websocket_event_handler, NULL);

    ESP_LOGI(TAG, "🌐 Connecting to WebSocket Server...");
    esp_websocket_client_start(client);

    // Start the reconnection task in the background
    xTaskCreate(websocket_reconnect_task, "websocket_reconnect_task", 2048, NULL, 5, NULL);
}
