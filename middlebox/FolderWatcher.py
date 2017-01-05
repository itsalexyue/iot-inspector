import os
import time
import signal
import sys

from BigBang import BigBang

class FolderWatcher:
    def __init__(self, folder, callback, filter=None):
        self.folder = os.path.realpath(folder)
        self.callback = callback
        self.filter = filter

        self._files_list = {}
        self._processed_time = 0

        self.update_files()
        pass

    def loop(self, interval=0.1, blocking=True):
        self.update_files()

        while True:
            self.update_files()

            if not blocking:
                return

            time.sleep(interval)

    def read_dir(self):
        dir_list = os.listdir(self.folder)

        return filter(lambda x : x.rsplit(".", 1)[-1] == self.filter, dir_list)

    def update_files(self):
        dir_list = self.read_dir()
        updated_files = []

        for file_name in dir_list:
            path = os.path.join(self.folder, file_name)
            last_modified_time = os.path.getmtime(path)

            # don't update if file is still being written to
            if time.time() - last_modified_time < 12:
                continue

            # don't add file to updated_files if it hasn't been modified from the last run
            if path in self._files_list and last_modified_time <= self._files_list[path]:
                continue

            updated_files.append({
                'modified_at': last_modified_time,
                'path': path
            })

            self._files_list[path] = last_modified_time

        # sort updated_files so that we start by processing files by time priority
        sorted(updated_files, key=lambda file: file['modified_at'])

        if len(updated_files) > 0:
            print updated_files
        for file_obj in updated_files:
            self.callback(file_obj['path']) # callback must be blocking function

b = BigBang()

def signal_handler(signal, frame):
    b.flush_all(done=True)
    sys.exit(0)
signal.signal(signal.SIGINT, signal_handler)

f = FolderWatcher(sys.argv[1], b.handle_pcap, filter="pcap")
try:
    f.loop()
except KeyboardInterrupt:
    b.flush_all()
    sys.exit(0)