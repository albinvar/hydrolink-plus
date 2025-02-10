idf_component_register(
    SRCS "src/water_quality.c"
    INCLUDE_DIRS "include"
    REQUIRES driver parson led_control esp_adc driver esp_system parson
)
