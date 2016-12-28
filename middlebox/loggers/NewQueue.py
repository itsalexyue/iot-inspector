import Queue

class NewQueue:
    def __init__(self):
        self.q = Queue.Queue()
        self.peek_element = None

    def enqueue(self, item):
        self.q.put(item)

    def dequeue(self):
        if self.peek_element:
            ret_val = self.peek_element
            self.peek_element = None
            return ret_val
        return self.q.get()

    def size(self):
        return self.q.qsize() + (1 if self.peek_element else 0)

    def peek(self):
        if self.peek_element:
            return self.peek_element

        self.peek_element = self.q.get()
        return self.peek_element