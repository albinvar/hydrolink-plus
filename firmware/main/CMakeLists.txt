idf_component_register(
    SRCS "app_main.c"               # Main source file
    INCLUDE_DIRS "."                # Include headers from the current directory
    PRIV_REQUIRES wifi_manager      # Wi-Fi manager dependency
                  esp_netif         # Network interface dependency
                  nvs_flash         # NVS dependency
                  api               # Add API component dependency
                    parson            # Add Parson component dependency
                    websocket         # Add WebSocket component dependency
)
