#include <stdio.h>
#include "esp_http_server.h"
#include "esp_log.h"

static const char *TAG = "API_SERVER";

// Handler for GET /status
esp_err_t status_handler(httpd_req_t *req) {
    ESP_LOGI(TAG, "Received GET /status request");

    // Output mock status to serial monitor
    const char *response = "{\"status\": \"running\", \"water_flow\": 2.5, \"valve\": \"closed\"}";
    httpd_resp_send(req, response, HTTPD_RESP_USE_STRLEN);

    ESP_LOGI(TAG, "Response sent: %s", response);
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
