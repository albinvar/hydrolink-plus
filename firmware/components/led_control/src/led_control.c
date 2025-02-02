#include "led_control.h"
#include "driver/gpio.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_log.h"

#define LED_GPIO_PIN 2  // Built-in LED pin

static const char *TAG = "LED_MODULE";
static led_status_t current_status = LED_STATUS_WIFI_DISCONNECTED;
static bool keep_running = true;

static void led_task(void *arg) {
    while (keep_running) {
        switch (current_status) {
            case LED_STATUS_WIFI_DISCONNECTED:
                ESP_LOGI(TAG, "LED: Wi-Fi Disconnected - Blinking every 3 sec");
                gpio_set_level(LED_GPIO_PIN, 1);
                vTaskDelay(pdMS_TO_TICKS(500));
                gpio_set_level(LED_GPIO_PIN, 0);
                vTaskDelay(pdMS_TO_TICKS(2500));
                break;

            case LED_STATUS_WS_DISCONNECTED:
                ESP_LOGI(TAG, "LED: WebSocket Disconnected - Two blinks every 1.5 sec");
                for (int i = 0; i < 2; i++) {
                    gpio_set_level(LED_GPIO_PIN, 1);
                    vTaskDelay(pdMS_TO_TICKS(250));
                    gpio_set_level(LED_GPIO_PIN, 0);
                    vTaskDelay(pdMS_TO_TICKS(250));
                }
                vTaskDelay(pdMS_TO_TICKS(750));
                break;

            case LED_STATUS_CONNECTED:
                ESP_LOGI(TAG, "LED: Connected - Solid ON");
                gpio_set_level(LED_GPIO_PIN, 1);
                vTaskDelay(pdMS_TO_TICKS(1000));
                break;

            default:
                ESP_LOGW(TAG, "Unknown LED status");
                break;
        }
    }
    vTaskDelete(NULL);
}

void led_init(void) {
    gpio_config_t io_conf = {
        .pin_bit_mask = (1ULL << LED_GPIO_PIN),
        .mode = GPIO_MODE_OUTPUT,
        .pull_up_en = GPIO_PULLUP_DISABLE,
        .pull_down_en = GPIO_PULLDOWN_DISABLE,
        .intr_type = GPIO_INTR_DISABLE
    };
    gpio_config(&io_conf);

    xTaskCreate(led_task, "led_task", 2048, NULL, 5, NULL);
}

void led_set_status(led_status_t status) {
    if (current_status == status) {
        return;  // ✅ Avoid redundant status changes
    }

    ESP_LOGI(TAG, "Changing LED status to: %d", status);
    current_status = status;
}

void led_stop(void) {
    ESP_LOGI(TAG, "Stopping LED task");
    keep_running = false;
}
