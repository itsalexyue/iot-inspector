from threading import Lock
from scapy.layers.inet import IP, TCP

class TCPLogger:
    def __init__(self):
        self.lock = Lock()

        self.connection_map = {}

    def log_event(self, in_intf, out_intf, pkt):
        if IP not in pkt or TCP not in pkt:
            raise ValueError("Error") # this is not a TCP packet

        # TCP connections are defined by: (src_ip, src_port, dst_ip, dst_port)
        self.lock.acquire()
        key = "%s;%s;%s;%s" % (pkt[IP].src, pkt[TCP].sport, pkt[IP].dst, pkt[TCP].dport)

        print key

        # if SYN = 1 and ACK = 0: # Client SYN connection
        # elif SYN = 1 and ACK = 1 and key in self.connection_map: # Server SYN-ACK
        # elif FIN = 1 # End of connection

        self.lock.release()