import pymongo
from django.conf import settings

class MongoDbProvider:
    def __init__(self, client=None, db_name=None):
        super().__init__()
        self.client = client or pymongo.MongoClient(settings.MONGODB_HOST)
        self.db = self.client['db_name'] if db_name else self.client[settings.MONGODB_DB_NAME]