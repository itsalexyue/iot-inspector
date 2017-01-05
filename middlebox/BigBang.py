from pymongo import MongoClient
import pymongo
from scapy.all import *
from scapy_ssl_tls.ssl_tls import *
import loggers

# connect('iot')

class BigBang:
    def __init__(self):
        self.connection = MongoClient('mongodb://localhost:27017')
        loggers.Loggers.set_instance('DNS', loggers.DNSLogger(self.connection.traffic))
        loggers.Loggers.set_instance('TCP', loggers.TCPLogger(self.connection.traffic))
        loggers.Loggers.set_instance('Netflow', loggers.NetflowLogger(self.connection.traffic))
        self.logging = {
            'DNS': loggers.Loggers.get_instance('DNS'),
            'TCP': loggers.Loggers.get_instance('TCP'),
            'Netflow': loggers.Loggers.get_instance('Netflow')
        }

        # self.connection.traffic.tcp.create_index([("src", pymongo.TEXT), ("sport", pymongo.TEXT), ("dst", pymongo.TEXT), ("dport", pymongo.TEXT)])
        self.pkt_count = 0
        self.device_mac = set()

    def handle_pcap(self, file_path):
        with PcapReader(file_path) as pcap_reader:
            while True:
                pkt = pcap_reader.read_packet()
                if pkt == None:
                    break
                if not pkt.haslayer(Ether):
                    print pkt.show()
                    continue

                mac_addr = pkt[Ether].src
                self.mac_check(mac_addr)

                for logger_name in self.logging.iterkeys():
                    if self.logging[logger_name].filter(pkt):
                        self.logging[logger_name].handle_packet(pkt)
                self.pkt_count += 1
                if self.pkt_count % 1000 == 0:
                    print self.pkt_count
                    for logger_name in self.logging.iterkeys():
                        self.logging[logger_name].flush_data()

                # if self.logging['DNS'].filter(pkt):
                #     self.logging['DNS'].handle_packet(pkt)
                # if self.logging['TCP'].filter(pkt):
                #     self.logging['TCP'].handle_packet(pkt)
                # if self.logging['Netflow'].filter(pkt):
                #     self.logging['Netflow'].handle_packet(pkt)
        self.logging['Netflow'].flush_data(done=True)
        self.logging['DNS'].flush_data(done=True)
        self.logging['TCP'].flush_data(done=True)

        # cap = pyshark.FileCapture(file_path)
        #
        # # print dir(cap[0])
        # # print cap[0].sniff_time
        # # print cap[0].captured_length # this length is in bytes
        #
        # for pkt in cap:
        #     mac_addr = pkt.eth.addr
        #     self.mac_check(mac_addr)
        #
            # for logger_name in self.logging.iterkeys():
            #     if self.logging[logger_name].filter(pkt):
            #         self.logging[logger_name].handle_packet(pkt)
            # self.pkt_count += 1
            # if self.pkt_count % 1000 == 0:
            #     print self.pkt_count
            #     for logger_name in self.logging.iterkeys():
            #         self.logging[logger_name].flush_data()
        #         # self.logging['Netflow'].flush_data()
        #         # self.logging['TCP'].flush_data()

    def mac_check(self, mac_addr):
        if mac_addr in self.device_mac:
            return

        # query the db to check if mac is already stored in it, otherwise add it to the db
        self.connection.traffic.mac_table.update({
            "mac": mac_addr
        }, {
            "mac": mac_addr
        }, upsert=True)
        self.device_mac.add(mac_addr)

    def flush_all(self, done=False):
        for logger_name in self.logging.iterkeys():
            self.logging[logger_name].flush_data(done)