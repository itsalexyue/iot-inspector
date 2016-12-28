import socket
import sys
import threading
from scapy.all import sniff, sendp, conf
from scapy.layers.inet import IP, TCP, UDP

from TCPLogger import TCPLogger

class PacketHandler:
    def __init__(self, intf_list):
        self.intf_list = intf_list

        self.tcp_logger = TCPLogger()

    def start(self):
        for (in_intf, out_intf) in self.intf_list:
            t = threading.Thread(target=self.middlebox, args=(in_intf, out_intf, conf.L2socket(iface=out_intf)))
            t.start()

    def middlebox(self, in_intf, out_intf, out_socket):
        sniff(iface=in_intf,
              prn=lambda pkt : self.handle_packet(in_intf, out_intf, out_socket, pkt))

    def handle_packet(self, in_intf, out_intf, out_socket, pkt):
        print pkt.summary()
        sys.stdout.flush()

        # Logging infrastructure
        if TCP in pkt:
            self.send_packets(out_socket, self.tcp_logger.log_event(in_intf, out_intf, pkt))
        elif UDP in pkt:
            pass


        # self.send_packet(out_socket, pkt)

    def send_packet(self, out_socket, pkt):
        if not pkt:
            return

        out_socket.send(pkt)

    def send_packets(self, out_socket, pkts):
        if not pkts:
            return

        for pkt in pkts:
            out_socket.send(pkt)

if __name__ == "__main__":
    # handler = PacketHandler(["en0", "en0"])
    handler = PacketHandler([("eth0", "wlan0"), ("wlan0", "eth0")])
    handler.start()
