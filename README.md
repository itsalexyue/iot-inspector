# IoT-Inspector

## Install instructions

Execute the following commands from the terminal of the Raspberry Pi:

```
$ git clone https://github.com/NoahApthorpe/iot-inspector
$ cd iot-inspector
$ chmod 744 install.sh
$ chmod 744 start.sh
$ sudo ./install.sh
```

## Packet capture instructions

From the `iot-inspector` directory, execute the following command

```
$ sudo ./start.sh
```

This will start capturing packets on the wireless interface of the Raspberry Pi and saving pcap files to `/home`.
It also starts Python backend code that parses the pcap files and stores
processed data in a Mongo database. Finally, it starts a node.js webserver to display the data with a
user-friendly interface.

To analyze IoT devices, associate IoT devices with the WiFi network "Pi3-AP".  The WiFi password is "strawberry".

Note that this password is public, so the WiFi network should be considered insecure. **This
tool is for research purposes only and should not be used to transmit sensitive data.**

The web interface can then be accessed on localhost:3000. If you want to view it directly on the
Raspberry Pi, run the command

```
$ startx
```

This  will launch the Raspberry Pi's  GUI desktop. Start the
default browser and type "localhost:3000" in the address bar.





