#include "led_control.h"
#include "driver/gpio.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_log.h"

#define LED_GPIO_PIN 2  // Built-in LED pin

static const char *TAG = "LED_MODULE";
static led_status_t current_status = LED_STATUS_WIFI_DISCONNECTED;
static bool keep_running = true;
static TaskHandle_t led_task_handle = NULL;

/**
 * @brief Handles the LED blinking logic in an optimized way.
 */
static void led_task(void *arg) {
    led_status_t last_status = LED_STATUS_WIFI_DISCONNECTED; // Store last LED state

    while (keep_running) {
        if (current_status != last_status) {
            ESP_LOGI(TAG, "LED Status Changed: %d", current_status);
            last_status = current_status;  // Update last status
        }

        switch (current_status) {
            case LED_STATUS_WIFI_DISCONNECTED:
                gpio_set_level(LED_GPIO_PIN, 1);
                vTaskDelay(pdMS_TO_TICKS(500));
                gpio_set_level(LED_GPIO_PIN, 0);
                vTaskDelay(pdMS_TO_TICKS(2500));
                break;

            case LED_STATUS_WS_DISCONNECTED:
                for (int i = 0; i < 2; i++) {
                    gpio_set_level(LED_GPIO_PIN, 1);
                    vTaskDelay(pdMS_TO_TICKS(250));
                    gpio_set_level(LED_GPIO_PIN, 0);
                    vTaskDelay(pdMS_TO_TICKS(250));
                }
                vTaskDelay(pdMS_TO_TICKS(750));
                break;

            case LED_STATUS_CONNECTED:
                gpio_set_level(LED_GPIO_PIN, 1);
                vTaskDelay(pdMS_TO_TICKS(1000));  // Small delay to avoid CPU overload
                break;

            default:
                ESP_LOGW(TAG, "Unknown LED status");
                break;
        }
    }

    ESP_LOGI(TAG, "LED Task Stopped");
    vTaskDelete(NULL);
}

/**
 * @brief Initializes the LED GPIO and starts the LED task.
 */
void led_init(void) {
    gpio_config_t io_conf = {
        .pin_bit_mask = (1ULL << LED_GPIO_PIN),
        .mode = GPIO_MODE_OUTPUT,
        .pull_up_en = GPIO_PULLUP_DISABLE,
        .pull_down_en = GPIO_PULLDOWN_DISABLE,
        .intr_type = GPIO_INTR_DISABLE
    };
    gpio_config(&io_conf);

    if (led_task_handle == NULL) {
        xTaskCreate(led_task, "led_task", 2048, NULL, 5, &led_task_handle);
    }
}

/**
 * @brief Sets the LED status and updates only when changed.
 */
void led_set_status(led_status_t status) {
    if (current_status == status) {
        return;  // ✅ Avoid redundant updates
    }

    ESP_LOGI(TAG, "Changing LED status to: %d", status);
    current_status = status;
}

/**
 * @brief Stops the LED task safely.
 */
void led_stop(void) {
    ESP_LOGI(TAG, "Stopping LED task");
    keep_running = false;
    if (led_task_handle != NULL) {
        vTaskDelete(led_task_handle);
        led_task_handle = NULL;
    }
}
