idf_component_register(
    SRCS "src/api.c"                # Source file for the API
    INCLUDE_DIRS "include"          # Header file directory
    PRIV_REQUIRES esp_http_server   # HTTP server dependency
                  esp_wifi          # Wi-Fi dependency
                  esp_system        # System functions
                  esp_netif         # Networking functions
                  driver            # Add driver dependency
)
