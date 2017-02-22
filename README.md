# IoT-Inspector

## System requirements
The IoT Inspector was developed and tested for use on a Raspberry Pi v3.  It should also work on any Linux machine that has both a WiFi interface that can be used as an access point and a wired connection to the internet.

## Install instructions

#### Connect to network
Connect the Raspberry Pi to the Internet using a wired Ethernet connection.  You can then access the Raspberry Pi from your computer using ssh.

#### Download code
Execute the following commands from the terminal of the Raspberry Pi:

```
$ mkdir /home/pi
$ cd /home/pi
$ git clone https://github.com/NoahApthorpe/iot-inspector
$ cd iot-inspector
$ chmod 744 install.sh
$ chmod 744 start.sh
```

#### Change WiFI SSID and Password
The defualt SSID of the WiFi network created by IoT-Inspector is "Pi3-AP". You may wish to change this, especially if you have multiple IoT-Inspectors running in proximity.  

The default password for the WiFi network created by IoT-Inspector is "raspberry".  You should change this password to prevent others from using the IoT-Inspector network. 

The SSID and password are set in the file `iot-inspector/config/hostapd.conf`. Open this file in a text editor and change the values of `ssid` and `wpa_passphrase` to new a SSID and password, respectively.  

#### Run install script

From the `iot-inspector` directory, run 
```
$ sudo ./install.sh
```
This will prepare the configure and start the WiFi network and download the required packages for packet capture and analysis.

## Usage Instructions

Execute the following commands to start capturing packets and displaying traffic information in a web interface:

```
$ cd /home/iot-inspector/www
$ sudo ../start.sh
```

This will start capturing packets on the wireless interface of the Raspberry Pi and saving pcap files to `/home`.
It also starts Python backend code that parses the pcap files and stores
processed data in a Mongo database. Finally, it starts a node.js webserver to display the data with a
user-friendly interface.

The web interface can then be accessed from your computer on \<Raspberry Pi IP\>:3000. You can find the IP address of the Raspberry Pi under `eth0` when you run `ifconfig` from the Raspberry Pi terminal.  If you want to view it directly on the
Raspberry Pi, connect the Pi to monitor and run the command

```
$ startx
```

This  will launch the Raspberry Pi's  GUI desktop. Then start the
default browser and type "localhost:3000" in the address bar.





