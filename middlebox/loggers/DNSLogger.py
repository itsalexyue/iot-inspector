import binascii
import pymongo

TCP_TIMEOUT = 60 # In seconds

class DNSLogger:
    def __init__(self, db):
        self.db = db
        self.dns_queries = {}
        self.ip_mappings = {}
        self.processed_time = 0
        self.db.dns.create_indexes([pymongo.IndexModel([("response.ip", pymongo.ASCENDING)])])

    def handle_packet(self, pkt):
        packet_unix_time = int(pkt.sniff_time.strftime("%s"))
        if int(pkt.dns.flags_response):
            dns_key = "%s;%s/%s;%s/%s" % (pkt.ip.dst, pkt.udp.dstport, pkt.ip.src, pkt.udp.srcport, pkt.dns.id)
        else:
            dns_key = "%s;%s/%s;%s/%s" % (pkt.ip.src, pkt.udp.srcport, pkt.ip.dst, pkt.udp.dstport, pkt.dns.id)

        if dns_key not in self.dns_queries:
            data = {
                'src': pkt.ip.src,
                'sport': pkt.udp.srcport,
                'dst': pkt.ip.dst,
                'dport': pkt.udp.dstport,
                'mac': pkt.eth.addr
            }
            self.dns_queries[dns_key] = data
        data = self.dns_queries[dns_key]

        # print pkt.dns.flags_response
        if not int(pkt.dns.flags_response):
            data['query'] = {
                'name': pkt.dns.qry_name,
                'type': pkt.dns.qry_type,
                'class': pkt.dns.qry_class,
                'time': pkt.sniff_timestamp
            }
        else:
            try:
                data['response'] = {
                    'name': pkt.dns.resp_name,
                    'ttl': pkt.dns.resp_ttl,
                    'type': pkt.dns.resp_type,
                    'time': pkt.sniff_timestamp,
                    'delta': pkt.dns.time,
                    'ip': map(lambda x: x.showname_value, pkt.dns.a.all_fields)
                }
                for ip in pkt.dns.a.all_fields:
                    self.ip_mappings[ip.showname_value] = data['query']['name']
            except:
                pass

        self.processed_time = packet_unix_time

    def filter(self, pkt):
        return 'dns' in pkt

    def flush_data(self, done=False):
        insert_items = []
        keys_to_delete = []

        for dns_key, data in self.dns_queries.iteritems():
            # validate that data is complete, the insert
            if 'response' in data or done:
                insert_items.append(data)
                keys_to_delete.append(dns_key)

        for dns_key in keys_to_delete:
            del self.dns_queries[dns_key]

        if len(insert_items) > 0:
            self.db.dns.insert_many(insert_items)

    def print_data(self):
        for k, v in self.tcp_streams.iteritems():
            print k, v

    def get_hostname(self, ip):
        if ip in self.ip_mappings:
            return self.ip_mappings[ip]
        else:
            return None
