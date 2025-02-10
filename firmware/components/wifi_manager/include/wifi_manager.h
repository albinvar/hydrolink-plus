#ifndef WIFI_MANAGER_H
#define WIFI_MANAGER_H

#include <stdbool.h>

void wifi_init_sta(const char *ssid, const char *password);
bool wifi_manager_is_connected(void);  // Returns true if connected

#endif // WIFI_MANAGER_H
