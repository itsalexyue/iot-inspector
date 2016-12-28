import sys
import threading
from scapy.all import sniff as scasniff, sendp
from scapy.all import *

import os
import socket

THRESHOLD = 200

#http://lartc.org/howto/lartc.qdisc.filters.html
#http://lartc.org/howto/lartc.qdisc.classful.html

def fprint(x):
    print x
    sys.stdout.flush()

class PacketHandler:

    def __init__(self, intf_list, conn_intf_dict, ip_map):
        self.intf_list = intf_list
        self.conn_intf_dict = conn_intf_dict
        self.ip_map = ip_map

        self.dns_id_mapping = {}
        self.invalid_dns_requests = {}

        # start tc
        os.system('tc qdisc add dev mb-eth0 root handle 1: htb default 2')
        os.system('tc class add dev mb-eth0 parent 1: classid 1:1 htb rate 100mbit burst 15k')

        os.system('tc class add dev mb-eth0 parent 1:1 classid 1:2 htb rate 90mbit burst 15k')
        os.system('tc qdisc add dev mb-eth0 parent 1:2 handle 2: sfq perturb 10')

    def start(self):
        for (in_intf, out_intf) in self.intf_list:
            t = threading.Thread(target = self.sniff, args = (in_intf, out_intf))
            t.start()

    def incoming(self, pkt, in_intf, out_intf):
        mac1 = self.conn_intf_dict[in_intf]
        mac2 = self.conn_intf_dict[out_intf]

        res = (pkt[Ether].src in mac1 or
               pkt[Ether].dst in mac2 or
                pkt[Ether].dst == "ff:ff:ff:ff:ff:ff")
        return res


    def handle_packet(self, in_intf, out_intf, pkt):
        # Handling ARP (DO NOT CHANGE)
        if (pkt[Ether].dst == "ff:ff:ff:ff:ff:ff"):
            if(pkt[Ether].type == 2054 and
                pkt[ARP].psrc in self.ip_map[in_intf] and
                pkt[ARP].pdst in self.ip_map[out_intf]):
                arp_header = pkt[ARP]
                arp_header.op = 2
                arp_header.hwdst = arp_header.hwsrc
                pdst = arp_header.pdst
                hwsrc =  "00:00:00:00:00:0%s" % pdst[-1]
                arp_header.hwsrc = hwsrc
                arp_header.pdst = arp_header.psrc
                arp_header.psrc = pdst
                pkt = Ether(src=hwsrc, dst=pkt[Ether].src)/arp_header
                sendp(pkt, iface=in_intf, verbose = 0)
            return

        fprint("received from %s" % in_intf)

        # forward packets out if not DNS packet
        if DNS not in pkt:
            # Forwarding the traffic to the target network (DO NOT CHANGE)
            sendp(pkt, iface=out_intf, verbose=0)
            return

        if in_intf == 'mb-eth0':  # leaving network
            src_ip = pkt[IP].src
            dns_id = pkt[DNS].id

            if src_ip not in self.dns_id_mapping:
                self.dns_id_mapping[src_ip] = {dns_id}
            else:
                self.dns_id_mapping[src_ip].add(dns_id)
        elif in_intf == 'mb-eth1':  # entering network
            dest_ip = pkt[IP].dst
            dns_id = pkt[DNS].id

            if dest_ip not in self.dns_id_mapping or dns_id not in self.dns_id_mapping[dest_ip]:
                if dest_ip not in self.invalid_dns_requests:
                    self.invalid_dns_requests[dest_ip] = 1
                else:
                    self.invalid_dns_requests[dest_ip] += 1

                    if self.invalid_dns_requests[dest_ip] == THRESHOLD:
                        print 'starting mitigation for %s' % dest_ip

                        if dest_ip == '10.0.0.1':
                            hex_ip = '0x0a000001'
                        else:
                            hex_ip = '0x0a000004'

                        # launch a new tc htb and create a filter
                        os.system('tc class add dev mb-eth0 parent 1:1 classid 1:10 htb rate 20bps ceil 20bps burst 1k')
                        os.system('tc qdisc add dev mb-eth0 parent 1:10 handle 10: sfq perturb 10')

                        os.system('tc filter add dev mb-eth0 parent 1: prio 10 u32 match u32 %s 0xffffffff at nexthdr+16 match u16 0x0035 0xffff at nexthdr+20 match u8 0x11 0xff at nexthdr+9 match u16 0x0800 0xffff at -2 flowid 1:10' % hex_ip)

                        # match UDP protocol
                        # match u8 0x11 0xff at nexthdr+9

                        # match Port 53 in UDP packet
                        # match u16 0x0035 0xffff at nexthdr+20

                        # match IP type in ethernet packet
                        # match u16 0x0800 0xffff at -2



                        # os.system(
                        #     'sudo tc class add dev mb-eth0 parent 1: classid 1:%s htb rate 1bps' % self.last_tc_id)
                        # # os.system('sudo tc qdisc add dev mb-eth0 parent 1:%s handle %s: sfq perturb 10' % (self.last_tc_id, self.last_tc_id))
                        #
                        # os.system(
                        #     'sudo tc filter add dev mb-eth0 parent 1: protocol ip prio 1 u32 match ip dst %s/32 match ip dport 53 0xffff flowid 1:%s' % (
                        #     dest_ip, self.last_tc_id))

            print self.invalid_dns_requests


	    # Forwarding the traffic to the target network (DO NOT CHANGE)
        try:
            sendp(pkt, iface=out_intf, verbose=0)
        except:
            return

    def sniff(self, in_intf, out_intf):
        scasniff(iface=in_intf, prn = lambda x : self.handle_packet(in_intf, out_intf, x),
                  lfilter = lambda x : self.incoming(x, in_intf, out_intf))

if __name__ == "__main__":
    intf1 = "mb-eth0"
    conn_mac1 = ["00:00:00:00:00:01", "00:00:00:00:00:04"]
    ip_list_1 = ["10.0.0.1", "10.0.0.4"]
    intf2 = "mb-eth1"
    ip_list_2 = ["10.0.0.2", "10.0.0.3"]
    conn_mac2 = ["00:00:00:00:00:02", "00:00:00:00:00:03"]

    intf_list = [(intf1, intf2), (intf2, intf1)]
    conn_intf_dict = {intf1 : conn_mac1, intf2 : conn_mac2}
    ip_map = {intf1 : ip_list_1, intf2 : ip_list_2}
    handler = PacketHandler(intf_list, conn_intf_dict, ip_map)
    handler.start()
