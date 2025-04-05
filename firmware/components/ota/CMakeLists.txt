idf_component_register(SRCS "src/ota_update.c"
                       INCLUDE_DIRS "include"
                       PRIV_REQUIRES esp_https_ota esp_http_client app_update led_control esp_partition nvs_flash)
