#include "freertos/FreeRTOS.h"
#include "freertos/task.h"


#ifndef WATER_QUALITY_H
#define WATER_QUALITY_H

#include <stdint.h>

// ✅ Define DEVICE_ID
#define DEVICE_ID "HLP001"

// ✅ Define ADC Channels for Sensors
#define PH_SENSOR_CHANNEL ADC_CHANNEL_7  // ✅ GPIO 35 corresponds to ADC1 Channel 7


typedef struct {
    int ph_raw;
    int conductivity_raw;
    int turbidity_raw;
    int temperature_raw;
} water_quality_data_t;

void water_quality_adc_init();
void water_quality_read(water_quality_data_t *data);
char* water_quality_to_json(water_quality_data_t *data);

#endif // WATER_QUALITY_H
