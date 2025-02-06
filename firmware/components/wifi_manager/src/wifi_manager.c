#include "wifi_manager.h"
#include "esp_wifi.h"
#include "esp_event.h"
#include "esp_log.h"
#include <string.h>  // For strncpy

static const char *TAG = "WIFI_MANAGER";
static bool wifi_initialized = false; // Prevent multiple initializations
static bool wifi_connected = false;  // Tracks connection state

// Event handler for Wi-Fi events
static void wifi_event_handler(void *arg, esp_event_base_t event_base, int32_t event_id, void *event_data) {
    if (event_base == WIFI_EVENT) {
        if (event_id == WIFI_EVENT_STA_START) {
            ESP_LOGI(TAG, "Wi-Fi started, connecting...");
            esp_wifi_connect();
        } else if (event_id == WIFI_EVENT_STA_DISCONNECTED) {
            ESP_LOGW(TAG, "Wi-Fi disconnected. Retrying...");
            wifi_connected = false;
            esp_wifi_connect();
        }
    } else if (event_base == IP_EVENT && event_id == IP_EVENT_STA_GOT_IP) {
        ip_event_got_ip_t *event = (ip_event_got_ip_t *)event_data;
        ESP_LOGI(TAG, "Wi-Fi connected. IP: " IPSTR, IP2STR(&event->ip_info.ip));
        wifi_connected = true;
    }
}


// Initialize Wi-Fi in station mode
void wifi_init_sta(const char *ssid, const char *password) {
    if (wifi_initialized) {
        ESP_LOGW(TAG, "Wi-Fi is already initialized. Skipping...");
        return;
    }

    ESP_LOGI(TAG, "Initializing Wi-Fi...");
    
    ESP_ERROR_CHECK(esp_netif_init());

    // Create a default Wi-Fi station interface
    esp_netif_create_default_wifi_sta();

    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_wifi_init(&cfg));

    // Register Wi-Fi and IP events only if not already registered
    ESP_ERROR_CHECK(esp_event_handler_instance_register(WIFI_EVENT, ESP_EVENT_ANY_ID, &wifi_event_handler, NULL, NULL));
    ESP_ERROR_CHECK(esp_event_handler_instance_register(IP_EVENT, IP_EVENT_STA_GOT_IP, &wifi_event_handler, NULL, NULL));

    wifi_config_t wifi_config = {
        .sta = {
            .ssid = "",
            .password = "",
        },
    };
    strncpy((char *)wifi_config.sta.ssid, ssid, sizeof(wifi_config.sta.ssid) - 1);
    strncpy((char *)wifi_config.sta.password, password, sizeof(wifi_config.sta.password) - 1);

    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
    ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_STA, &wifi_config));
    ESP_ERROR_CHECK(esp_wifi_start());

    ESP_LOGI(TAG, "Wi-Fi initialization complete. Connecting to %s...", ssid);
    
    wifi_initialized = true; // Mark as initialized
}

// Check if Wi-Fi is connected
bool wifi_manager_is_connected(void) {
    return wifi_connected;
}
