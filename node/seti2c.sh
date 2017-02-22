#!/bin/bash
# This script enables multiple I2C channels on the BBB
# To run as root at startup
echo cape-bone-iio > /sys/devices/bone_capemgr.9/slots
echo BB-I2C1 >/sys/devices/bone_capemgr.9/slots

