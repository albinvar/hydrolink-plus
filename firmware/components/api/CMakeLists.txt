idf_component_register(
    SRCS "src/api.c"                # Source file for the API
    INCLUDE_DIRS "include"          # Header file directory
    PRIV_REQUIRES esp_http_server   # Dependency for HTTP server
)
