#!/usr/bin/env bash

python /home/pi/iot-inspector/middlebox/FolderWatcher.py /home &
dumpcap -P -i wlan0 -w /home/res.pcap -b duration:10 -b files:248 &
node /home/pi/iot-inspector/web/bin/www &
