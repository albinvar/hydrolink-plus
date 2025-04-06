#include "esp_netif.h"
#include "esp_event.h"
#include "esp_log.h"
#include "nvs_flash.h"
#include "wifi_manager.h"
#include "api.h"
#include "websocket.h"
#include "led_control.h"
#include "water_quality.h"

static const char *TAG = "MAIN";


void app_main(void) {
    ESP_LOGI(TAG, "Starting HydroLink Plus...");

    water_quality_adc_init();

    ESP_ERROR_CHECK(nvs_flash_init());
    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());

    led_init();
    led_set_status(LED_STATUS_WIFI_DISCONNECTED);

    wifi_init_sta("demo", "12345678");

    while (!wifi_manager_is_connected()) {
        ESP_LOGI(TAG, "Waiting for Wi-Fi connection...");
        vTaskDelay(pdMS_TO_TICKS(1000));
    }

    ESP_LOGI(TAG, "Connected to Wi-Fi.");
    led_set_status(LED_STATUS_WS_DISCONNECTED);

    start_api_server();
    ESP_LOGI(TAG, "API server is running. You can send requests now.");

    websocket_init();
    ESP_LOGI(TAG, "WebSocket client is running.");
}
