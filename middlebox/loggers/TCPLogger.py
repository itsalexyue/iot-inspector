import binascii
# import netifaces
from Loggers import Loggers
from scapy.all import *
from scapy_ssl_tls.ssl_tls import *

TCP_TIMEOUT = 60 # In seconds

class TCPLogger:
    def __init__(self, db):
        self.db = db
        self.tcp_streams = {}
        self.processed_time = 0
        self.device_mac = 'b8:27:eb:0c:b8:a2'#netifaces.ifaddresses('wlan0')[netifaces.AF_LINK]

    def handle_packet(self, pkt):
        packet_unix_time = str(int(pkt.time))

        binary_flags = int(str(pkt[TCP].flags), 16)
        fin_flag = binary_flags & 1
        syn_flag = (binary_flags >> 1) & 1
        ack_flag = (binary_flags >> 4) & 1

        tcp_key_a = "%s;%s/%s;%s" % (pkt[IP].src, pkt[TCP].sport, pkt[IP].dst, pkt[TCP].dport)
        tcp_key_b = "%s;%s/%s;%s" % (pkt[IP].dst, pkt[TCP].dport, pkt[IP].src, pkt[TCP].sport)

        if tcp_key_a not in self.tcp_streams and tcp_key_b not in self.tcp_streams:
            tcp_key = tcp_key_a
            transmission_direction = 'up'

            host = Loggers.get_instance('DNS').get_hostname(pkt[IP].dst)
            if not host:
                Loggers.get_instance('DNS').get_hostname(pkt[IP].src)

            self.tcp_streams[tcp_key] = {
                'src': pkt[IP].src,
                'sport': pkt[TCP].sport,
                'dst': pkt[IP].dst,
                'dport': pkt[TCP].dport,
                'fin': {
                    'client': None,
                    'server': None
                },
                'mac': pkt[Ether].src,
                'host': host,
                'time': {
                    'start': pkt.time
                },
                'traffic': {
                    packet_unix_time: {
                        'up': {
                            'count': 1,
                            'bytes': int(pkt.len)
                        },
                        'down': {
                            'count': 0,
                            'bytes': 0
                        }
                    }
                },
                'ssl': {
                    'tls_client': None,
                    'tls_server': None
                }
            }
        else:
            tcp_key = tcp_key_b
            transmission_direction = 'down'
            if tcp_key_a in self.tcp_streams:
                tcp_key = tcp_key_a
                transmission_direction = 'up'

            if packet_unix_time not in self.tcp_streams[tcp_key]['traffic']:
                self.tcp_streams[tcp_key]['traffic'][packet_unix_time] = self._generate_empty_traffic_entry()

            self.tcp_streams[tcp_key]['traffic'][packet_unix_time][transmission_direction]['count'] += 1
            self.tcp_streams[tcp_key]['traffic'][packet_unix_time][transmission_direction]['bytes'] += int(pkt.len)

        if pkt.haslayer(TLSClientHello):
            self.tcp_streams[tcp_key]['ssl']['tls_client'] = pkt[TLSClientHello].version
            self.tcp_streams[tcp_key]['ssl']['cipher_options'] = pkt[TLSClientHello].cipher_suites
        if pkt.haslayer(TLSServerHello):
            self.tcp_streams[tcp_key]['ssl']['tls_server'] = pkt[TLSServerHello].version
            self.tcp_streams[tcp_key]['ssl']['cipher_suite'] = pkt[TLSServerHello].cipher_suite

        if fin_flag:
            if transmission_direction == "up":
                self.tcp_streams[tcp_key]["fin"]["client"] = pkt.time
            else:
                self.tcp_streams[tcp_key]["fin"]["server"] = pkt.time

            if self.tcp_streams[tcp_key]["fin"]["client"] and self.tcp_streams[tcp_key]["fin"]["server"]:
                self.tcp_streams[tcp_key]['time']['end'] = pkt.time

        #
        # if pkt.ip.src < pkt.ip.dst:
        #     tcp_key = "%s;%s/%s;%s" % (pkt.ip.src, pkt.tcp.srcport, pkt.ip.dst, pkt.tcp.dstport)
        # else:
        #     tcp_key = "%s;%s/%s;%s" % (pkt.ip.dst, pkt.tcp.dstport, pkt.ip.src, pkt.tcp.srcport)
        #
        #
        # # we are not capturing tcp streams where we do not have the initial 3-way handshake
        # if tcp_key not in self.tcp_streams and syn_flag:
        #     self.tcp_streams[tcp_key] = {
        #         'src': pkt.ip.src,
        #         'sport': pkt.tcp.srcport,
        #         'dst': pkt.ip.dst,
        #         'dport': pkt.tcp.dstport,
        #         'mac': pkt.eth.addr,
        #         'fin': False,
        #         'host': Loggers.get_instance('DNS').get_hostname(pkt.ip.dst),
        #         'time': {
        #             'start': packet_unix_time
        #         },
        #         'traffic': {}
        #     }
        #     self.tcp_streams[tcp_key]['traffic'][packet_unix_time] = {
        #         'up': {
        #             'count': 1,
        #             'bytes': int(pkt.captured_length)
        #         },
        #         'down': {
        #             'count': 0,
        #             'bytes': 0
        #         }
        #     }
        # elif tcp_key in self.tcp_streams:
        #     tcp_stream = self.tcp_streams[tcp_key]
        #
        #     if packet_unix_time not in tcp_stream['traffic']:
        #         if pkt.ip.src == tcp_stream['src'] and pkt.tcp.srcport == tcp_stream['sport']:
        #             tcp_stream['traffic'][packet_unix_time] = {
        #                 'up': {
        #                     'count': 1,
        #                     'bytes': int(pkt.captured_length)
        #                 },
        #                 'down': {
        #                     'count': 0,
        #                     'bytes': 0
        #                 }
        #             }
        #         else:
        #             tcp_stream['traffic'][packet_unix_time] = {
        #                 'down': {
        #                     'count': 1,
        #                     'bytes': int(pkt.captured_length)
        #                 },
        #                 'up': {
        #                     'count': 0,
        #                     'bytes': 0
        #                 }
        #             }
        #     else:
        #         if pkt.ip.src == tcp_stream['src'] and pkt.tcp.srcport == tcp_stream['sport']:
        #             tcp_stream['traffic'][packet_unix_time]['up']['count'] += 1
        #             tcp_stream['traffic'][packet_unix_time]['up']['bytes'] += int(pkt.captured_length)
        #         else:
        #             tcp_stream['traffic'][packet_unix_time]['down']['count'] += 1
        #             tcp_stream['traffic'][packet_unix_time]['down']['bytes'] += int(pkt.captured_length)
        #
        #     if fin_flag or 'end' in tcp_stream['time']:
        #         tcp_stream['time']['end'] = packet_unix_time
        #         print packet_unix_time, tcp_stream['time'], fin_flag

        self.processed_time = int(packet_unix_time)

        return

    def _generate_empty_traffic_entry(self):
        return {
            'up': {
                'count': 0,
                'bytes': 0
            },
            'down': {
                'count': 0,
                'bytes': 0
            }
        }

    def filter(self, pkt):
        return pkt.haslayer(TCP)

    def flush_data(self, done=False):
        databaseOp = False
        keysToDelete = []
        bulk = self.db.tcp.initialize_ordered_bulk_op()
        for tcp_key, tcp_stream in self.tcp_streams.iteritems():
            # check if stream has finished
            if not (tcp_stream['fin']['client'] and tcp_stream['fin']['server']) and not done:
                continue

            bulk.insert(tcp_stream)
            databaseOp = True

            keysToDelete.append(tcp_key)

        for tcp_key in keysToDelete:
            del self.tcp_streams[tcp_key]

        if databaseOp:
            bulk.execute()

        # operationToExecute = False
        # bulk = self.db.tcp.initialize_ordered_bulk_op()
        # for tcp_key, v in self.tcp_streams.iteritems():
        #     unprocessed_traffic = {}
        #     set_update = {}
        #     keys_to_delete = []
        #     for timestamp, traffic_entry in v['traffic'].iteritems():
        #         if int(timestamp) >= self.processed_time and not done:
        #             unprocessed_traffic[timestamp] = traffic_entry
        #         else:
        #             set_update['traffic.'+str(timestamp)] = traffic_entry
        #             keys_to_delete.append(str(timestamp))
        #     for e in keys_to_delete:
        #         del v['traffic'][e]
        #
        #     if len(set_update) <= 0:
        #         continue
        #
        #     set_update['time'] = v['time']
        #     set_update['host'] = v['host']
        #
        #     bulk.find({
        #         'src': v['src'],
        #         'srcport': v['sport'],
        #         'dst': v['dst'],
        #         'dstport': v['dport'],
        #         'mac': v['mac']
        #     }).upsert().update({
        #         '$set': set_update
        #     })
        #     operationToExecute = True
        #
        #     # self.db.tcp.update({
        #     #     'src': v['src'],
        #     #     'srcport': v['sport'],
        #     #     'dst': v['dst'],
        #     #     'dstport': v['dport']
        #     # }, {
        #     #     '$set': set_update
        #     # }, upsert=True)
        # if operationToExecute:
        #     bulk.execute()

    def print_data(self):
        for k, v in self.tcp_streams.iteritems():
            print k, v