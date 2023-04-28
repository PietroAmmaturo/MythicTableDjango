import pymongo
from bson import ObjectId
from bson.json_util import loads, dumps
from .utils import JsonPatchTranslator
from MythicTable.exceptions import MythicTableException
from pymongo.errors import PyMongoError
from rest_framework.exceptions import NotFound
from MythicTable.providers import MongoDbProvider

class MongoDbCollectionProvider(MongoDbProvider):
    COLLECTION_FIELD = '_collection'
    USER_ID_FIELD = '_userid'
    CAMPAIGN_FIELD = '_campaign'

    def __init__(self, client=None, db_name=None):
        super().__init__(client, db_name)
        self.collection_collection = self.db['collections']

    def create(self, user_id: str, collection: str, j_object: dict) -> dict:
        j_object[self.USER_ID_FIELD] = user_id
        j_object[self.COLLECTION_FIELD] = collection
        result = self.collection_collection.insert_one(j_object)
        j_object['_id'] = str(result.inserted_id)
        return j_object

    def get_list(self, user_id: str, collection: str) -> list[dict]:
        print("retriving collection", collection)
        bson_results = self.collection_collection.find(
            {self.COLLECTION_FIELD: collection, self.USER_ID_FIELD: user_id}
        ).to_list(length=None)
        results = [self._bson_to_json(bson_result) for bson_result in bson_results]
        if not results:
            message = f"Could not find collection '{collection}' for user '{user_id}'"
            raise MythicTableException(message)
        return results

    def get(self, user_id: str, collection_id: str, obj_id: str) -> dict:
        try:
            bson = self.collection_collection.find_one(
                {self.COLLECTION_FIELD: collection_id, self.USER_ID_FIELD: user_id, '_id': ObjectId(obj_id)}
            )
            if bson:
                return self._bson_to_json(bson)
        except PyMongoError:
            pass

        message = f"Could not find item '{obj_id}' in collection '{collection_id}' for user '{user_id}'"
        raise NotFound(message)

    def delete(self, user_id: str, collection_id: str, obj_id: str) -> int:
        result = self.collection_collection.delete_one(
            {self.COLLECTION_FIELD: collection_id, self.USER_ID_FIELD: user_id, '_id': ObjectId(obj_id)}
        )
        if not result.deleted_count:
            message = f"Could not delete item '{obj_id}' in collection '{collection_id}' for user '{user_id}'"
            raise MythicTableException(message)
        return result.deleted_count

    def update(self, user_id: str, collection_id: str, obj_id: str, patch: dict) -> int:
        bson_patch = self._json_to_bson(patch)
        result = self.collection_collection.update_one(
            {self.COLLECTION_FIELD: collection_id, self.USER_ID_FIELD: user_id, '_id': ObjectId(obj_id)},
            {'$set': bson_patch}
        )
        if not result.modified_count:
            message = f"Could not update item '{obj_id}' in collection '{collection_id}' for user '{user_id}'"
            raise MythicTableException(message)
        return result.modified_count

    def create_by_campaign(self, user_id, collection, campaign_id, j_object):
        bson = loads(dumps(j_object))
        if '_id' in bson:
            del bson['_id']
        bson[self.USER_ID_FIELD] = user_id
        bson[self.COLLECTION_FIELD] = collection
        bson[self.CAMPAIGN_FIELD] = campaign_id
        result = self.collection_collection.insert_one(bson)
        bson["_id"] = result.inserted_id
        a = self.collection_collection.find_one({"_id" : ObjectId(str(result.inserted_id))})
        return loads(dumps(bson))

    def get_list_by_campaign(self, collection, campaign_id):
        results = list(self.collection_collection.find({
            self.COLLECTION_FIELD: collection,
            self.CAMPAIGN_FIELD: campaign_id
        }))
        if results:
            for result in results:
                result["_id"] = str(result["_id"])
            return [loads(dumps(result)) for result in results]
        message = f"Could not find collection '{collection}' for campaign '{campaign_id}'"
        print(message)
        return []

    def get_by_campaign(self, collection_id, campaign_id, id):
        results = self.collection_collection.find({
            self.COLLECTION_FIELD: collection_id,
            self.CAMPAIGN_FIELD: campaign_id,
            "_id": ObjectId(id)
        }).to_list(length=None)
        bson = results[0] if results else None
        if bson:
            return loads(dumps(bson))
        message = f"Could not find item '{id}' in collection '{collection_id}' for campaign '{campaign_id}'"
        raise MythicTableException(message)

    def update_by_campaign(self, collection_id, campaign_id, id, patch):
        filter = {
            self.COLLECTION_FIELD: collection_id,
            self.CAMPAIGN_FIELD: campaign_id,
            "_id": ObjectId(id)
        }
        updated = self.internal_update(patch, filter)
        if updated == 0:
            message = f"Could not update item '{id}' in collection '{collection_id}' for campaign '{campaign_id}'"
            raise MythicTableException(message)
        return updated

    def delete_by_campaign(self, collection_id, campaign_id, id):
        deleted = self.collection_collection.delete_one({
            self.COLLECTION_FIELD: collection_id,
            self.CAMPAIGN_FIELD: campaign_id,
            "_id": ObjectId(id)
        })
        if deleted.deleted_count == 0:
            message = f"Could not delete item '{id}' in collection '{collection_id}' for campaign '{campaign_id}'"
            raise MythicTableException(message)
        return deleted.deleted_count

    def internal_update(self, patch, filter):
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
        results = self.collection_collection.update_one(filter, update)
        self.internal_pull(patch, filter)
        return results.modified_count

    def internal_pull(self, patch, filter):
        pull_ops_used = False
        pull_ops = {}

        for i in range(len(patch.operations)):
            operation = patch.operations[i]
            path = operation.path
            if operation.op == "remove" and JsonPatchTranslator.path_is_array(path):
                pull_ops = {"$pull": {JsonPatchTranslator.json_path_to_mongo_array_name(path): None}}
                pull_ops_used = True

        if pull_ops_used:
            self.collection_collection.update_one(filter, pull_ops)

    def _bson_to_json(self, bson):
        json_dict = {}
        for key, value in bson.items():
            if isinstance(value, ObjectId):
                json_dict[key] = str(value)
            elif isinstance(value, dict):
                json_dict[key] = self._bson_to_json(value)
            else:
                json_dict[key] = value
        return json_dict