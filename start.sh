#!/usr/bin/env bash

# Check that script is running under root
if [ "$EUID" -ne 0 ] ; then
    echo "This start script must be run with sudo."
    exit 1
fi

python /home/pi/iot-inspector/middlebox/FolderWatcher.py /home &
dumpcap -P -i wlan0 -w /home/res.pcap -b duration:10 -b files:248 &
node /home/pi/iot-inspector/web/bin/www &
