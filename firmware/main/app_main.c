#include "esp_netif.h"
#include "esp_event.h"
#include "esp_log.h"
#include "nvs_flash.h"
#include "wifi_manager.h" // Custom Wi-Fi manager we'll implement
#include "api.h"          // Your HTTP server API

static const char *TAG = "MAIN";

void app_main(void) {
    ESP_LOGI(TAG, "Starting HydroLink Plus...");

    // Initialize NVS for Wi-Fi credentials storage
    ESP_ERROR_CHECK(nvs_flash_init());
    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());

    // Connect to Wi-Fi
    wifi_init_sta("demo", "12345678"); // Replace with your Wi-Fi credentials

    // Start the API server
    start_api_server();

    ESP_LOGI(TAG, "API server is running. You can send requests now.");
}
