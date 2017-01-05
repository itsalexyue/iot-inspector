import binascii
import pymongo
from scapy.all import *

TCP_TIMEOUT = 60 # In seconds

class DNSLogger:
    def __init__(self, db):
        self.db = db
        self.dns_queries = {}
        self.ip_mappings = {}
        self.processed_time = 0
        # self.db.dns.create_indexes([pymongo.IndexModel([("response.ip", pymongo.ASCENDING)])])

    def handle_packet(self, pkt):
        packet_unix_time = int(pkt.time)
        if int(pkt[DNS].qr): # check if query response
            dns_key = "%s;%s/%s;%s/%s" % (pkt[IP].dst, pkt[UDP].dport, pkt[IP].src, pkt[UDP].sport, pkt[DNS].id)
        else:
            dns_key = "%s;%s/%s;%s/%s" % (pkt[IP].src, pkt[UDP].sport, pkt[IP].dst, pkt[UDP].dport, pkt[DNS].id)

        if dns_key not in self.dns_queries:
            data = {
                'src': pkt[IP].src,
                'sport': pkt[UDP].sport,
                'dst': pkt[IP].dst,
                'dport': pkt[UDP].dport,
                'mac': pkt[Ether].src,
                'time': pkt.time
            }
            self.dns_queries[dns_key] = data
        data = self.dns_queries[dns_key]

        if not int(pkt[DNS].qr):
            data['query'] = []
            qd = pkt[DNS].qd
            while qd:
                data['query'].append({
                    'name': qd.qname,
                    'type': qd.qtype,
                    'class': qd.qclass
                })
                qd = qd.payload
        else:
            data['an'] = []
            data['ns'] = []
            data['ar'] = []

            an = pkt[DNS].an
            while an:
                data['an'].append({
                    'name': an.rrname,
                    'class': an.rclass,
                    'ttl': an.ttl,
                    'type': an.type,
                    'data': an.rdata
                })
                self.add_mapping(an.rdata, an.rrname)
                an = an.payload


            ns = pkt[DNS].ns
            while ns:
                data['ns'].append({
                    'name': ns.rrname,
                    'class': ns.rclass,
                    'ttl': ns.ttl,
                    'type': ns.type,
                    'data': ns.rdata
                })
                ns = ns.payload

            ar = pkt[DNS].ar
            while ar:
                data['ar'].append({
                    'name': ar.rrname,
                    'class': ar.rclass,
                    'ttl': ar.ttl,
                    'type': ar.type,
                    'data': ar.rdata
                })
                self.add_mapping(ar.rdata, ar.rrname)
                ar = ar.payload

            # try:
            #
            #     data['ans'] = {
            #         'name': pkt[DNS].rrname,
            #         'class': pkt[DNS].rclass,
            #         'ttl': pkt[DNS].ttl,
            #         'type': pkt[DNS].type,
            #         'time': pkt.time,
            #         'delta': pkt[DNS].an.time,
            #         'ip': rdata#map(lambda x: x.showname_value, pkt.dns.a.all_fields)
            #     }
            #     # for ip in pkt.dns.a.all_fields:
            #     #     self.ip_mappings[ip.showname_value] = data['query']['name']
            # except:
            #     pass

        self.processed_time = packet_unix_time

    def filter(self, pkt):
        return pkt.haslayer(DNS)

    def flush_data(self, done=False):
        databaseOp = False
        keysToDelete = []
        bulk = self.db.dns.initialize_ordered_bulk_op()
        for dns_key, dns_entry in self.dns_queries.iteritems():
            if len(dns_entry['an']) > 0:
                bulk.insert(dns_entry)
                databaseOp = True

                keysToDelete.append(dns_key)

        for dns_key in keysToDelete:
            del self.dns_queries[dns_key]

        if databaseOp:
            bulk.execute()

    def print_data(self):
        for k, v in self.tcp_streams.iteritems():
            print k, v

    def get_hostname(self, ip):
        if ip in self.ip_mappings:
            return self.ip_mappings[ip]
        else:
            return None

    def add_mapping(self, ip, host):
        self.ip_mappings[ip] = host
