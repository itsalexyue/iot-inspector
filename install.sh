#!/usr/bin/env bash

run_it () {

PREFIX="/usr/local"

set -e
set -u

# Let's display everything on stderr.
exec 1>&2

UNAME=$(uname)
# Check to see if OS is Raspbian
if [ "$UNAME" != "Linux" ] ; then
    echo "This installer script is only designed to be executed on Raspbian."
    echo "Please run this script on a v3 Rasbperry Pi with Raspbian installed."
    exit 1
fi

# Check that script is running under root
if [ "$EUID" -ne 0 ] ; then
    echo "This installer script must be run with sudo."
    exit 1
fi

export DEBIAN_FRONTEND=noninteractive

# All relative paths are relative to SCRIPT location
parent_path=$( cd "$(dirname "${BASH_SOURCE}")" ; pwd -P )
cd "$parent_path"

# Update the package manager and install base packages
apt-get update --assume-yes
# apt-get upgrade --assume-yes

### STEP 1: Wi-Fi Setup ###
apt-get install --assume-yes hostapd dnsmasq

mv ./config/dhcpcd.conf /etc/dhcpcd.conf
mv ./config/interfaces /etc/network/interfaces
service dhcpcd restart

mv ./config/hostapd.conf /etc/hostapd/hostapd.conf
mv ./config/hostapd /etc/default/hostapd

mv ./config/dnsmasq.conf /etc/dnsmasq.conf

echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
sh -c "echo 1 > /proc/sys/net/ipv4/ip_forward"
iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
iptables -A FORWARD -i eth0 -o wlan0 -m state --state RELATED,ESTABLISHED -j ACCEPT
iptables -A FORWARD -i wlan0 -o eth0 -j ACCEPT

sh -c "iptables-save > /etc/iptables.ipv4.nat"

ifdown wlan0
ifup wlan0

service hostapd restart
service dnsmasq restart

# update-rc.d hostapd enable
# update-rc.d dnsmasq enable


# ifdown wlan0
# mv ./config/interfaces /etc/network/interfaces
# ifconfig wlan0 192.168.12.1

# # Restart wireless and the DHCP server
# mv ./config/hostapd.conf /etc/hostapd/hostapd.conf
# mv ./config/hostapd /etc/default/hostapd
# mv ./config/dhcpcd.conf /etc/dhcp/dhcpcd.conf
# mv ./config/isc-dhcp-server /etc/default/isc-dhcp-server

# # Enable ipv4 forwarding
# echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
# sh -c "echo 1 > /proc/sys/net/ipv4/ip_forward"

# iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
# iptables -A FORWARD -i eth0 -o wlan0 -m state --state RELATED,ESTABLISHED -j ACCEPT
# iptables -A FORWARD -i wlan0 -o eth0 -j ACCEPT

# # Save the iptables routing rules
# sh -c "iptables-save > /etc/iptables.ipv4.nat"

# mv ./config/rc.local /etc/rc.local

# service hostapd restart
# service isc-dhcp-server restart

# update-rc.d hostapd enable
# update-rc.d isc-dhcp-server enable

## STEP 2: Dumpcap Setup ###
apt-get install --assume-yes tshark python-pip mongodb-server  # tshark includes dumpcap
pip install -r ../middlebox/requirements.txt

curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs

cd ../web && npm install


# update-rc.d mongod enable


}

run_it
