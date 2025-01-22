#include "esp_netif.h"
#include "esp_event.h"
#include "esp_log.h"
#include "nvs_flash.h"
#include "wifi_manager.h" // Custom Wi-Fi manager we'll implement
#include "api.h"          // Your HTTP server API
#include "websocket.h"
#include "led_control.h"   // LED module for status indication

static const char *TAG = "MAIN";

void app_main(void) {
    ESP_LOGI(TAG, "Starting HydroLink Plus...");

    // Initialize NVS for Wi-Fi credentials storage
    ESP_ERROR_CHECK(nvs_flash_init());
    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());

    // Initialize the LED module
    led_init();

    // Set LED status to indicate Wi-Fi disconnected initially
    led_set_status(LED_STATUS_WIFI_DISCONNECTED);

    // Connect to Wi-Fi
    if (wifi_init_sta("demo", "12345678") == ESP_OK) {
        ESP_LOGI(TAG, "Wi-Fi connected.");
        led_set_status(LED_STATUS_WS_DISCONNECTED); // Update LED status for WebSocket not connected
    } else {
        ESP_LOGE(TAG, "Wi-Fi connection failed.");
        return; // Stop further initialization if Wi-Fi fails
    }

    // Start the API server
    start_api_server();
    ESP_LOGI(TAG, "API server is running. You can send requests now.");

    // Initialize WebSocket
    if (websocket_init() == ESP_OK) {
        ESP_LOGI(TAG, "WebSocket client is running.");
        led_set_status(LED_STATUS_CONNECTED); // Update LED status for successful connection
    } else {
        ESP_LOGE(TAG, "WebSocket initialization failed.");
        led_set_status(LED_STATUS_WS_DISCONNECTED); // Update LED status for WebSocket disconnected
    }
}
