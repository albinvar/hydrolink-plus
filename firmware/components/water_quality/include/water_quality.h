#ifndef WATER_QUALITY_H
#define WATER_QUALITY_H

#include "esp_adc/adc_oneshot.h"

// ✅ Define DEVICE_ID
#define DEVICE_ID "HLP001"

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
