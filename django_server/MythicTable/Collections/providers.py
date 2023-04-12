import pymongo
from bson import ObjectId
from bson.json_util import loads, dumps
from .utils import JsonPatchTranslator
from MythicTable.exceptions import MythicTableException
from pymongo.errors import PyMongoError
from rest_framework.exceptions import NotFound

client = pymongo.MongoClient('mongodb://admin:abc123!@localhost')
for dbn in client.list_database_names():
    print("db", dbn)
    db = client[dbn]
    for coll in db.list_collection_names():
        print("coll", coll)
db = client['admin']
collections_collection = db["collections"]

class MongoDbCollectionProvider:
    COLLECTION_FIELD = '_collection'
    USER_ID_FIELD = '_userid'
    CAMPAIGN_FIELD = '_campaign'

    def create(user_id: str, collection: str, j_object: dict) -> dict:
        j_object[MongoDbCollectionProvider.USER_ID_FIELD] = user_id
        j_object[MongoDbCollectionProvider.COLLECTION_FIELD] = collection
        result = collections_collection.insert_one(j_object)
        j_object['_id'] = str(result.inserted_id)
        return j_object

    def get_list(user_id: str, collection_id: str) -> list[dict]:
        bson_results = collections_collection.find(
            {MongoDbCollectionProvider.COLLECTION_FIELD: collection_id, MongoDbCollectionProvider.USER_ID_FIELD: user_id}
        ).to_list(length=None)
        results = [MongoDbCollectionProvider._bson_to_json(bson_result) for bson_result in bson_results]
        if not results:
            print(f"Could not find collection '{collection_id}' for user '{user_id}'")
        return results

    def get(user_id: str, collection_id: str, obj_id: str) -> dict:
        try:
            bson = collections_collection.find_one(
                {MongoDbCollectionProvider.COLLECTION_FIELD: collection_id, MongoDbCollectionProvider.USER_ID_FIELD: user_id, '_id': ObjectId(obj_id)}
            )
            if bson:
                return MongoDbCollectionProvider._bson_to_json(bson)
        except PyMongoError:
            pass

        message = f"Could not find item '{obj_id}' in collection '{collection_id}' for user '{user_id}'"
        print(message)
        raise NotFound(message)

    def delete(MongoDbCollectionProvider, user_id: str, collection_id: str, obj_id: str) -> int:
        result = collections_collection.delete_one(
            {MongoDbCollectionProvider.COLLECTION_FIELD: collection_id, MongoDbCollectionProvider.USER_ID_FIELD: user_id, '_id': ObjectId(obj_id)}
        )
        if not result.deleted_count:
            print(f"Could not delete item '{obj_id}' in collection '{collection_id}' for user '{user_id}'")
        return result.deleted_count

    def update(user_id: str, collection_id: str, obj_id: str, patch: dict) -> int:
        bson_patch = MongoDbCollectionProvider._json_to_bson(patch)
        result = collections_collection.update_one(
            {MongoDbCollectionProvider.COLLECTION_FIELD: collection_id, MongoDbCollectionProvider.USER_ID_FIELD: user_id, '_id': ObjectId(obj_id)},
            {'$set': bson_patch}
        )
        if not result.modified_count:
            print(f"Could not update item '{obj_id}' in collections_collection '{collection_id}' for user '{user_id}'")
        return result.modified_count

    def create_by_campaign(user_id, collection, campaign_id, j_object):
        j_object.pop("_id", None)
        bson = loads(dumps(j_object))
        bson[MongoDbCollectionProvider.USER_ID_FIELD] = user_id
        bson[MongoDbCollectionProvider.COLLECTION_FIELD] = collection
        bson[MongoDbCollectionProvider.CAMPAIGN_FIELD] = campaign_id
        result = collections_collection.insert_one(bson)
        a = collections_collection.find_one({"_id" : ObjectId(str(result.inserted_id))})
        print("result", result, bson, a)
        return loads(dumps(bson))

    def get_list_by_campaign(collection_id, campaign_id):
        results = collections_collection.find({
            MongoDbCollectionProvider.COLLECTION_FIELD: collection_id,
            MongoDbCollectionProvider.CAMPAIGN_FIELD: campaign_id
        }).to_list(length=None)
        if results:
            return [loads(dumps(result)) for result in results]
        print(f"Could not find collection '{collection_id}' for campaign '{campaign_id}'")
        return []

    def get_by_campaign(collection_id, campaign_id, id):
        results = collections_collection.find({
            MongoDbCollectionProvider.COLLECTION_FIELD: collection_id,
            MongoDbCollectionProvider.CAMPAIGN_FIELD: campaign_id,
            "_id": ObjectId(id)
        }).to_list(length=None)
        bson = results[0] if results else None
        if bson:
            return loads(dumps(bson))
        message = f"Could not find item '{id}' in collection '{collection_id}' for campaign '{campaign_id}'"
        print(message)
        raise MythicTableException(message)

    def update_by_campaign(collection_id, campaign_id, id, patch):
        filter = {
            MongoDbCollectionProvider.COLLECTION_FIELD: collection_id,
            MongoDbCollectionProvider.CAMPAIGN_FIELD: campaign_id,
            "_id": ObjectId(id)
        }
        updated = MongoDbCollectionProvider.internal_update(patch, filter)
        if updated == 0:
            print(f"Could not update item '{id}' in collection '{collection_id}' for campaign '{campaign_id}'")
        return updated

    def delete_by_campaign(collection_id, campaign_id, id):
        print("---Actually removing from DB")
        deleted = collections_collection.delete_one({
            MongoDbCollectionProvider.COLLECTION_FIELD: collection_id,
            MongoDbCollectionProvider.CAMPAIGN_FIELD: campaign_id,
            "_id": ObjectId(id)
        })
        if deleted.deleted_count == 0:
            print(f"Could not delete item '{id}' in collection '{collection_id}' for campaign '{campaign_id}'")
        return deleted.deleted_count

    def internal_update(patch, filter):
        patch_operation = patch.operations[0]
        if patch_operation["op"] == "remove":
            update = {"$unset": {JsonPatchTranslator.json_path_to_mongo_path(patch_operation["path"]): ""}}
        else:
            update = {"$set": {JsonPatchTranslator.json_path_to_mongo_path(patch_operation["path"]): translator.json_to_mongo(patch_operation["value"])}}
        for i in range(1, len(patch.operations)):
            operation = patch.operations[i]
            if operation["op"] == "remove":
                update["$unset"][JsonPatchTranslator.json_path_to_mongo_path(operation["path"])] = ""
            else:
                update["$set"][JsonPatchTranslator.json_path_to_mongo_path(operation["path"])] = translator.json_to_mongo(operation["value"])
        results = collections_collection.update_one(filter, update)
        MongoDbCollectionProvider.internal_pull(patch, filter)
        return results.modified_count

    def internal_pull(patch, filter):
        pull_ops_used = False
        pull_ops = {}

        for i in range(len(patch.operations)):
            operation = patch.operations[i]
            path = operation.path
            if operation.op == "remove" and JsonPatchTranslator.path_is_array(path):
                pull_ops = {"$pull": {JsonPatchTranslator.json_path_to_mongo_array_name(path): None}}
                pull_ops_used = True

        if pull_ops_used:
            collections_collection.update_one(filter, pull_ops)

    def _bson_to_json(bson):
        json_dict = {}
        for key, value in bson.items():
            if isinstance(value, ObjectId):
                json_dict[key] = str(value)
            elif isinstance(value, dict):
                json_dict[key] = MongoDbCollectionProvider._bson_to_json(value)
            else:
                json_dict[key] = value
        return json_dict