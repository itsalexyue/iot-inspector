import threading
from NewQueue import NewQueue
from scapy.all import *
from scapy_ssl_tls.ssl_tls import *
from sets import Set

class NetflowLogger:
    def __init__(self, db):
        self.db = db
        self.flow_list = NewQueue()
        self.flows = {}
        self.processed_time = 0
        self.device_mac = 'b8:27:eb:0c:b8:a2'
        self.lock = threading.Lock()

        return

    def handle_packet(self, pkt):
        packet_unix_time = int(pkt.time)

        if packet_unix_time not in self.flows:
            self.flows[packet_unix_time] = {
                'time': packet_unix_time,
                'bytes': 0,
                'count': 0,
                'types': Set([]),
                'traffic': {
                    'up': {
                        'bytes': 0,
                        'count': 0
                    },
                    'down': {
                        'bytes': 0,
                        'count': 0
                    }
                }
            }

        self.flows[packet_unix_time]['count'] += 1
        self.flows[packet_unix_time]['bytes'] += len(pkt)
        self.flows[packet_unix_time]['types'].update(Set(self.packet_names(pkt)))

        if pkt.haslayer(IP):
            if pkt[IP].src == self.device_mac:
                self.flows[packet_unix_time]['traffic']['up']['count'] += 1
                self.flows[packet_unix_time]['traffic']['up']['bytes'] += len(pkt)
            else:
                self.flows[packet_unix_time]['traffic']['up']['count'] += 1
                self.flows[packet_unix_time]['traffic']['up']['bytes'] += len(pkt)

        self.processed_time = packet_unix_time

        # if 'ip' in pkt:
        #     self.lock.acquire(True)
        #     if packet_unix_time not in self.flows:
        #         self.flows[packet_unix_time] = {
        #             'time': packet_unix_time
        #         }
        #         self.flow_list.enqueue(self.flows[packet_unix_time])
        #     flow_data = self.flows[packet_unix_time]
        #
        #     key = "%s;%s" % (pkt.ip.src, pkt.ip.dst)
        #
        #     if key not in flow_data:
        #         flow_data[key] = {
        #             'time': packet_unix_time,
        #             'src': pkt.ip.src,
        #             'dst': pkt.ip.dst,
        #             'mac': pkt.eth.src,
        #         }
        #
        #         if pkt.eth.src == self.device_mac: # inbound traffic
        #             flow_data[key]['traffic'] = {
        #                 'down': {
        #                     'count': 1,
        #                     'bytes': int(pkt.captured_length)
        #                 },
        #                 'up': {
        #                     'count': 0,
        #                     'bytes': 0
        #                 }
        #             }
        #         else: # outbound traffic
        #             flow_data[key]['traffic'] = {
        #                 'up': {
        #                     'count': 1,
        #                     'bytes': int(pkt.captured_length)
        #                 },
        #                 'down': {
        #                     'count': 0,
        #                     'bytes': 0
        #                 }
        #             }
        #
        #     else:
        #         if pkt.eth.src == self.device_mac:
        #             flow_data[key]['traffic']['down']['count'] += 1
        #             flow_data[key]['traffic']['down']['bytes'] += int(pkt.captured_length)
        #         else:
        #             flow_data[key]['traffic']['up']['count'] += 1
        #             flow_data[key]['traffic']['up']['bytes'] += int(pkt.captured_length)
        #     self.lock.release()
        # self.processed_time = packet_unix_time'ip' in pkt:
        #     self.lock.acquire(True)
        #     if packet_unix_time not in self.flows:
        #         self.flows[packet_unix_time] = {
        #             'time': packet_unix_time
        #         }
        #         self.flow_list.enqueue(self.flows[packet_unix_time])
        #     flow_data = self.flows[packet_unix_time]
        #
        #     key = "%s;%s" % (pkt.ip.src, pkt.ip.dst)
        #
        #     if key not in flow_data:
        #         flow_data[key] = {
        #             'time': packet_unix_time,
        #             'src': pkt.ip.src,
        #             'dst': pkt.ip.dst,
        #             'mac': pkt.eth.src,
        #         }
        #
        #         if pkt.eth.src == self.device_mac: # inbound traffic
        #             flow_data[key]['traffic'] = {
        #                 'down': {
        #                     'count': 1,
        #                     'bytes': int(pkt.captured_length)
        #                 },
        #                 'up': {
        #                     'count': 0,
        #                     'bytes': 0
        #                 }
        #             }
        #         else: # outbound traffic
        #             flow_data[key]['traffic'] = {
        #                 'up': {
        #                     'count': 1,
        #                     'bytes': int(pkt.captured_length)
        #                 },
        #                 'down': {
        #                     'count': 0,
        #                     'bytes': 0
        #                 }
        #             }
        #
        #     else:
        #         if pkt.eth.src == self.device_mac:
        #             flow_data[key]['traffic']['down']['count'] += 1
        #             flow_data[key]['traffic']['down']['bytes'] += int(pkt.captured_length)
        #         else:
        #             flow_data[key]['traffic']['up']['count'] += 1
        #             flow_data[key]['traffic']['up']['bytes'] += int(pkt.captured_length)
        #     self.lock.release()
        # self.processed_time = packet_unix_time

    def packet_names(self, pkt):
        yield pkt.name
        while pkt.payload:
            pkt = pkt.payload
            yield pkt.name

    def filter(self, pkt):
        return True

    def flush_data(self, done=False):
        databaseOp = False
        keysToDelete = []
        bulk = self.db.netflow.initialize_ordered_bulk_op()
        for time, netflow_data in self.flows.iteritems():
            if time < self.processed_time:
                netflow_data['types'] = list(netflow_data['types'])
                bulk.insert(netflow_data)
                databaseOp = True

                keysToDelete.append(time)

        for time in keysToDelete:
            del self.flows[time]

        if databaseOp:
            bulk.execute()


        self.lock.acquire(True)
        insert_items = []

        while self.flow_list.size() > 0 and (self.flow_list.peek()['time'] < self.processed_time or done):
            flows_at_time_second = self.flow_list.dequeue()

            for k, v in flows_at_time_second.iteritems():
                if k == 'time':
                    continue

                insert_items.append(v)

            del self.flows[flows_at_time_second['time']]

        if len(insert_items) > 0:
            self.db.netflow.insert_many(insert_items)

        self.lock.release()





        # insert_items = []
        # while True:
        #     if not self.flow_list_peek:
        #         self.flow_list_peek = self.flow_list.get()
        #     current_item = self.flow_list_peek
        #
        #     print current_item['time'], self.processed_time
        #     if current_item['time'] < self.processed_time or done:
        #         for k, v in current_item.iteritems():
        #             print k,v
        #             insert_items.append(v)
        #         del self.flows[current_item['time']]
        #
        #         self.flow_list_peek = None
        #     else:
        #         break
        #
        # print insert_items[0]
        # self.db.netflow.insert_one(insert_items[0])
        # # self.db.netflow.insert_many(insert_items)
        # print 'done'
        #
        # self.lock.release()
        # # lock hashmap and send data to db

    def print_data(self):
        for k in self.flows.iterkeys():
            print k, self.flows[k]