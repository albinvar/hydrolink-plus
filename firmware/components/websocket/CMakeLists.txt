idf_component_register(
    SRCS "src/websocket.c"
    INCLUDE_DIRS "include"
    PRIV_REQUIRES esp_websocket_client parson led_control water_quality ota
)
