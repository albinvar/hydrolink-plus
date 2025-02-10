#include "esp_http_server.h"
#include "esp_log.h"
#include "esp_wifi.h"
#include "esp_system.h"
#include "esp_netif.h"
#include "esp_chip_info.h"
#include "esp_heap_caps.h"
#include "driver/adc.h" // For voltage/current monitoring (if needed)

static const char *TAG = "API_SERVER";

// Handler for GET /status
esp_err_t status_handler(httpd_req_t *req) {
    char response[1024]; // Buffer for JSON response
    esp_chip_info_t chip_info;
    wifi_ap_record_t ap_info;

    // Gather Chip Info
    esp_chip_info(&chip_info);

    // Gather Wi-Fi Info
    esp_err_t wifi_status = esp_wifi_sta_get_ap_info(&ap_info);

    // Gather RAM Info
    size_t free_heap = heap_caps_get_free_size(MALLOC_CAP_8BIT);
    size_t min_free_heap = heap_caps_get_minimum_free_size(MALLOC_CAP_8BIT);

    // Example voltage and current values (use actual ADC reading logic)
    float voltage = 3.3; // Replace with real voltage reading
    float current = 0.5; // Replace with real current reading

    // Create JSON response
    snprintf(response, sizeof(response),
        "{"
        "\"chip\": {"
            "\"model\": \"%s\","
            "\"cores\": %d,"
            "\"revision\": %d"
        "},"
        "\"memory\": {"
            "\"free_heap\": %zu,"
            "\"min_free_heap\": %zu"
        "},"
        "\"wifi\": {"
            "\"connected\": %s,"
            "\"ssid\": \"%s\","
            "\"rssi\": %d"
        "},"
        "\"power\": {"
            "\"voltage\": %.2f,"
            "\"current\": %.2f"
        "}"
        "}",
        CONFIG_IDF_TARGET,
        chip_info.cores,
        chip_info.revision,
        free_heap,
        min_free_heap,
        wifi_status == ESP_OK ? "true" : "false",
        wifi_status == ESP_OK ? (char *)ap_info.ssid : "N/A",
        wifi_status == ESP_OK ? ap_info.rssi : 0,
        voltage,
        current
    );

    // Set response headers
    httpd_resp_set_type(req, "application/json");
    httpd_resp_set_status(req, "200 OK");

    // Send JSON response
    httpd_resp_send(req, response, HTTPD_RESP_USE_STRLEN);

    ESP_LOGI(TAG, "Sent status: %s", response);
    return ESP_OK;
}

// Handler for POST /task
esp_err_t task_handler(httpd_req_t *req) {
    char buffer[100];
    int received = httpd_req_recv(req, buffer, sizeof(buffer) - 1);

    if (received <= 0) {
        httpd_resp_send_500(req);
        ESP_LOGE(TAG, "Failed to read request body");
        return ESP_FAIL;
    }

    buffer[received] = '\0'; // Null-terminate the received data
    ESP_LOGI(TAG, "Received POST /task with body: %s", buffer);

    // Output mock task execution to serial monitor
    ESP_LOGI(TAG, "Executing task: %s", buffer);
    httpd_resp_send(req, "Task executed", HTTPD_RESP_USE_STRLEN);

    return ESP_OK;
}

// Function to start the API server
void start_api_server(void) {
    httpd_handle_t server = NULL;
    httpd_config_t config = HTTPD_DEFAULT_CONFIG();

    if (httpd_start(&server, &config) != ESP_OK) {
        ESP_LOGE(TAG, "Failed to start HTTP server");
        return;
    }

    // Register the /status endpoint
    httpd_uri_t status_uri = {
        .uri       = "/status",
        .method    = HTTP_GET,
        .handler   = status_handler,
        .user_ctx  = NULL
    };
    httpd_register_uri_handler(server, &status_uri);

    // Register the /task endpoint
    httpd_uri_t task_uri = {
        .uri       = "/task",
        .method    = HTTP_POST,
        .handler   = task_handler,
        .user_ctx  = NULL
    };
    httpd_register_uri_handler(server, &task_uri);

    ESP_LOGI(TAG, "HTTP server started");
}
