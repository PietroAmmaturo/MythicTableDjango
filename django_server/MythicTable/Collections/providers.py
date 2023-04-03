import pymongo
from bson import ObjectId

client = pymongo.MongoClient('mongodb://admin:abc123!@localhost')
for dbn in client.list_database_names():
    print("db", dbn)
    db = client[dbn]
    for coll in db.list_collection_names():
        print("coll", coll)
db = client['admin']
collection = db["collections"]

class MongoDbCollectionProvider:
    def create_by_campaign(owner: str, collection: str, campaign_id: str, j_object: dict):
        return {}