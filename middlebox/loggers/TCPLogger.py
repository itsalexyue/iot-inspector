import binascii
import netifaces
from Loggers import Loggers

TCP_TIMEOUT = 60 # In seconds

class TCPLogger:
    def __init__(self, db):
        self.db = db
        self.tcp_streams = {}
        self.processed_time = 0
        self.device_mac = 'b8:27:eb:0c:b8:a2'#netifaces.ifaddresses('wlan0')[netifaces.AF_LINK]

    def handle_packet(self, pkt):
        packet_unix_time = str(int(pkt.sniff_time.strftime("%s")))

        binary_flags = int(str(pkt.tcp.flags), 16)
        fin_flag = binary_flags & 1
        syn_flag = (binary_flags >> 1) & 1
        ack_flag = (binary_flags >> 4) & 1

        # tcp_key = "%s;%s/%s;%s" % (pkt.ip.src, pkt.tcp.srcport, pkt.ip.dst, pkt.tcp.dstport)

        if pkt.ip.src < pkt.ip.dst:
            tcp_key = "%s;%s/%s;%s" % (pkt.ip.src, pkt.tcp.srcport, pkt.ip.dst, pkt.tcp.dstport)
        else:
            tcp_key = "%s;%s/%s;%s" % (pkt.ip.dst, pkt.tcp.dstport, pkt.ip.src, pkt.tcp.srcport)


        # we are not capturing tcp streams where we do not have the initial 3-way handshake
        if tcp_key not in self.tcp_streams and syn_flag:
            self.tcp_streams[tcp_key] = {
                'src': pkt.ip.src,
                'sport': pkt.tcp.srcport,
                'dst': pkt.ip.dst,
                'dport': pkt.tcp.dstport,
                'mac': pkt.eth.addr,
                'fin': False,
                'host': Loggers.get_instance('DNS').get_hostname(pkt.ip.dst),
                'time': {
                    'start': packet_unix_time
                },
                'traffic': {}
            }
            self.tcp_streams[tcp_key]['traffic'][packet_unix_time] = {
                'up': {
                    'count': 1,
                    'bytes': int(pkt.captured_length)
                },
                'down': {
                    'count': 0,
                    'bytes': 0
                }
            }
        elif tcp_key in self.tcp_streams:
            tcp_stream = self.tcp_streams[tcp_key]

            if packet_unix_time not in tcp_stream['traffic']:
                if pkt.ip.src == tcp_stream['src'] and pkt.tcp.srcport == tcp_stream['sport']:
                    tcp_stream['traffic'][packet_unix_time] = {
                        'up': {
                            'count': 1,
                            'bytes': int(pkt.captured_length)
                        },
                        'down': {
                            'count': 0,
                            'bytes': 0
                        }
                    }
                else:
                    tcp_stream['traffic'][packet_unix_time] = {
                        'down': {
                            'count': 1,
                            'bytes': int(pkt.captured_length)
                        },
                        'up': {
                            'count': 0,
                            'bytes': 0
                        }
                    }
            else:
                if pkt.ip.src == tcp_stream['src'] and pkt.tcp.srcport == tcp_stream['sport']:
                    tcp_stream['traffic'][packet_unix_time]['up']['count'] += 1
                    tcp_stream['traffic'][packet_unix_time]['up']['bytes'] += int(pkt.captured_length)
                else:
                    tcp_stream['traffic'][packet_unix_time]['down']['count'] += 1
                    tcp_stream['traffic'][packet_unix_time]['down']['bytes'] += int(pkt.captured_length)

            if fin_flag or 'end' in tcp_stream['time']:
                tcp_stream['time']['end'] = packet_unix_time
                print packet_unix_time, tcp_stream['time'], fin_flag

        self.processed_time = int(packet_unix_time)

        return
        # print syn_flag, ack_flag, fin_flag

        if tcp_key in self.tcp_streams:
            tcp_stream = self.tcp_streams[tcp_key]

            if packet_unix_time not in tcp_stream['traffic']:
                tcp_stream['traffic'][packet_unix_time] = 1
            else:
                tcp_stream['traffic'][packet_unix_time] += 1
        else:
            self.tcp_streams[tcp_key] = {
                'src': pkt.ip.src,
                'sport': pkt.tcp.srcport,
                'dst': pkt.ip.dst,
                'dport': pkt.tcp.dstport,
                'mac': pkt.eth.addr,
                'traffic': {}
            }
            self.tcp_streams[tcp_key]['traffic'][packet_unix_time] = 1

        if syn_flag:
            if tcp_key in self.tcp_streams and syn_flag: # SYN-ACK from server
                pass
            elif tcp_key in self.tcp_streams:
                raise Exception
            else: # SYN from client
                pass

        self.processed_time = int(packet_unix_time)





                # if TCP in pkt:
            # print pkt.summary()
            # key = "%s;%s;%s;%s" % (pkt[IP].src, pkt[TCP].sport, pkt[IP].dst, pkt[TCP].dport)
            # print key
        # else:
        #     print "PKT NOT TCP"
        return

    def filter(self, pkt):
        return 'tcp' in pkt

    def flush_data(self, done=False):
        operationToExecute = False
        bulk = self.db.tcp.initialize_ordered_bulk_op()
        for tcp_key, v in self.tcp_streams.iteritems():
            unprocessed_traffic = {}
            set_update = {}
            keys_to_delete = []
            for timestamp, traffic_entry in v['traffic'].iteritems():
                if int(timestamp) >= self.processed_time and not done:
                    unprocessed_traffic[timestamp] = traffic_entry
                else:
                    set_update['traffic.'+str(timestamp)] = traffic_entry
                    keys_to_delete.append(str(timestamp))
            for e in keys_to_delete:
                del v['traffic'][e]

            if len(set_update) <= 0:
                continue

            set_update['time'] = v['time']
            set_update['host'] = v['host']

            bulk.find({
                'src': v['src'],
                'srcport': v['sport'],
                'dst': v['dst'],
                'dstport': v['dport'],
                'mac': v['mac']
            }).upsert().update({
                '$set': set_update
            })
            operationToExecute = True

            # self.db.tcp.update({
            #     'src': v['src'],
            #     'srcport': v['sport'],
            #     'dst': v['dst'],
            #     'dstport': v['dport']
            # }, {
            #     '$set': set_update
            # }, upsert=True)
        if operationToExecute:
            bulk.execute()

    def print_data(self):
        for k, v in self.tcp_streams.iteritems():
            print k, v