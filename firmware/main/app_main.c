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

// 🔁 Check and clear OTA flag
static bool ota_was_successful_and_clear_flag() {
    bool result = false;
    nvs_handle_t nvs;
    if (nvs_open("ota_status", NVS_READWRITE, &nvs) == ESP_OK) {
        uint8_t ota_done = 0;
        if (nvs_get_u8(nvs, "ota_done", &ota_done) == ESP_OK && ota_done == 1) {
            result = true;
            nvs_erase_key(nvs, "ota_done");
            nvs_commit(nvs);
            ESP_LOGI(TAG, "✅ OTA success flag was found and cleared");
        }
        nvs_close(nvs);
    }
    return result;
}

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

    // 📢 OTA success message (send once)
    if (ota_was_successful_and_clear_flag()) {
        websocket_broadcast("ota_success");
        ESP_LOGI(TAG, "📢 OTA success message broadcasted");
    }
}
