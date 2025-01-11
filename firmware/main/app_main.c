#include "esp_netif.h"
#include "esp_event.h"
#include "esp_log.h"
#include "api.h"

static const char *TAG = "MAIN";

void app_main(void) {
    ESP_LOGI(TAG, "Starting HydroLink Plus...");

    // Initialize the networking stack
    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());

    // Start the API server
    start_api_server();

    ESP_LOGI(TAG, "API server is running. You can send requests now.");
}
