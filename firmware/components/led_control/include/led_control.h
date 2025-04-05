#ifndef LED_MODULE_H
#define LED_MODULE_H

#include "driver/gpio.h"

typedef enum {
    LED_STATUS_WIFI_DISCONNECTED,
    LED_STATUS_WS_DISCONNECTED,
    LED_STATUS_CONNECTED,
    LED_STATUS_OTA_IN_PROGRESS
} led_status_t;

void led_init(void);
void led_set_status(led_status_t status);
void led_stop(void);

#endif // LED_MODULE_H
