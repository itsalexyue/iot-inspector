class Loggers:
    instance = {}

    @staticmethod
    def set_instance(name, obj):
        Loggers.instance[name] = obj

    @staticmethod
    def get_instance(name):
        return Loggers.instance[name]