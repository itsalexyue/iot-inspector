On a newly installed Raspberry Pi (I recommend the Sep. 2016 release)...

```
cd /home/pi
git clone https://github.com/itsalexyue/iot-inspector.git
cd iot-inspector
sudo bash install.sh
```

To manually start the web service...

```
cd /home/pi/iot-inspector/web
PORT=3456 node bin/www
```
