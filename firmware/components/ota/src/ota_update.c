#include "ota_update.h"
#include "esp_log.h"
#include "esp_system.h"
#include "esp_https_ota.h"
#include "led_control.h"

static const char *TAG = "OTA_UPDATE";

void ota_start(const char *url) {
    ESP_LOGI(TAG, "🌐 Starting OTA update from URL: %s", url);
    led_set_status(LED_STATUS_OTA_IN_PROGRESS);

    esp_http_client_config_t config = {
        .url = url,
        .timeout_ms = 10000,
        .keep_alive_enable = true,
        .skip_cert_common_name_check = true,
        .crt_bundle_attach = NULL,   // ✅ Skip server verification (OK for HTTP or self-signed HTTPS)
    };

    esp_https_ota_config_t ota_config = {
        .http_config = &config,
    };

    esp_err_t ret = esp_https_ota(&ota_config);
    if (ret == ESP_OK) {
        ESP_LOGI(TAG, "✅ OTA update successful. Rebooting...");
        esp_restart();
    } else {
        ESP_LOGE(TAG, "❌ OTA update failed: %s", esp_err_to_name(ret));
        led_set_status(LED_STATUS_WS_DISCONNECTED);
    }
}
