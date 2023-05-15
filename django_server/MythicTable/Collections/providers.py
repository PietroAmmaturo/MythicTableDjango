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

    def create(self, profile_id: str, collection: str, j_object: dict) -> dict:
        j_object[self.USER_ID_FIELD] = profile_id
        j_object[self.COLLECTION_FIELD] = collection
        result = self.collection_collection.insert_one(j_object)
        j_object['_id'] = str(result.inserted_id)
        return j_object

    def get_list(self, profile_id: str, collection: str) -> list[dict]:
        print("retriving collection", collection)
        bson_results = self.collection_collection.find(
            {self.COLLECTION_FIELD: collection, self.USER_ID_FIELD: profile_id}
        ).to_list(length=None)
        results = [self._bson_to_json(bson_result) for bson_result in bson_results]
        if not results:
            message = f"Could not find collection '{collection}' for user '{profile_id}'"
            raise MythicTableException(message)
        return results

    def get(self, profile_id: str, collection_id: str, item_id: str) -> dict:
        try:
            bson = self.collection_collection.find_one(
                {self.COLLECTION_FIELD: collection_id, self.USER_ID_FIELD: profile_id, '_id': ObjectId(item_id)}
            )
            if bson:
                return self._bson_to_json(bson)
        except PyMongoError:
            pass

        message = f"Could not find item '{item_id}' in collection '{collection_id}' for user '{profile_id}'"
        raise NotFound(message)

    def delete(self, profile_id: str, collection_id: str, item_id: str) -> int:
        result = self.collection_collection.delete_one(
            {self.COLLECTION_FIELD: collection_id, self.USER_ID_FIELD: profile_id, '_id': ObjectId(item_id)}
        )
        if not result.deleted_count:
            message = f"Could not delete item '{item_id}' in collection '{collection_id}' for user '{profile_id}'"
            raise MythicTableException(message)
        return result.deleted_count

    def update(self, profile_id: str, collection_id: str, item_id: str, patch: dict) -> int:
        bson_patch = self._bson_to_json(patch)
        result = self.collection_collection.update_one(
            {self.COLLECTION_FIELD: collection_id, self.USER_ID_FIELD: profile_id, '_id': ObjectId(item_id)},
            {'$set': bson_patch}
        )
        if not result.modified_count:
            message = f"Could not update item '{item_id}' in collection '{collection_id}' for user '{profile_id}'"
            raise MythicTableException(message)
        return result.modified_count

    def create_by_campaign(self, profile_id: str, collection: str, campaign_id: str, item: str) -> str:
        bson = item
        if '_id' in bson:
            del bson['_id']
        bson[self.USER_ID_FIELD] = profile_id
        bson[self.COLLECTION_FIELD] = collection
        bson[self.CAMPAIGN_FIELD] = campaign_id
        result = self.collection_collection.insert_one(bson)
        bson["_id"] = result.inserted_id
        inserted = self.collection_collection.find_one({"_id" : ObjectId(str(result.inserted_id))})
        return self._bson_to_json(inserted)

    def get_list_by_campaign(self, collection: str, campaign_id: str) -> list[str]:
        results = list(self.collection_collection.find({
            self.COLLECTION_FIELD: collection,
            self.CAMPAIGN_FIELD: campaign_id
        }))
        if results:
            return [self._bson_to_json(result) for result in results]
        message = f"Could not find collection '{collection}' for campaign '{campaign_id}'"
        print(message)
        return []

    def get_by_campaign(self, collection_id: str, campaign_id: str, item_id: str) -> list[str]:
        results = list(self.collection_collection.find({
            self.COLLECTION_FIELD: collection_id,
            self.CAMPAIGN_FIELD: campaign_id,
            "_id": ObjectId(item_id)
        }))
        bson = results[0] if results else None
        if bson:
            return self._bson_to_json(bson)
        message = f"Could not find item '{item_id}' in collection '{collection_id}' for campaign '{campaign_id}'"
        raise MythicTableException(message)

    def update_by_campaign(self, collection: str, campaign_id: str, item_id: str, patch: list[dict[str, str]]) -> int:
        filter = {
            self.COLLECTION_FIELD: collection,
            self.CAMPAIGN_FIELD: campaign_id,
            "_id": ObjectId(item_id)
        }
        updated = self.internal_update(patch, filter)
        if updated == 0:
            message = f"Could not update item '{item_id}' in collection '{collection}' for campaign '{campaign_id}'"
            raise MythicTableException(message)
        return updated

    def delete_by_campaign(self, collection: str, campaign_id: str, item_id: str) -> int:
        deleted = self.collection_collection.delete_one({
            self.COLLECTION_FIELD: collection,
            self.CAMPAIGN_FIELD: campaign_id,
            "_id": ObjectId(item_id)
        })
        if deleted.deleted_count == 0:
            message = f"Could not delete item '{item_id}' in collection '{collection}' for campaign '{campaign_id}'"
            raise MythicTableException(message)
        return deleted.deleted_count

    def internal_update(self, patch: list[dict[str, str]], filter: dict[str, ]) -> int:
        patch_operation = patch[0]
        if patch_operation["op"] == "remove":
            update = {"$unset": {JsonPatchTranslator.json_path_to_mongo_path(patch_operation["path"]): ""}}
        else:
            update = {"$set": {JsonPatchTranslator.json_path_to_mongo_path(patch_operation["path"]): JsonPatchTranslator.json_to_bson(patch_operation["value"])}}
        for i in range(1, len(patch)):
            operation = patch[i]
            if operation["op"] == "remove":
                update["$unset"][JsonPatchTranslator.json_path_to_mongo_path(operation["path"])] = ""
            else:
                update["$set"][JsonPatchTranslator.json_path_to_mongo_path(operation["path"])] = JsonPatchTranslator.json_to_bson(operation["value"])
        results = self.collection_collection.update_one(filter, update)
        self.internal_pull(patch, filter)
        print(results, results.modified_count)
        return results.modified_count

    def internal_pull(self, patch: list[dict[str, str]], filter: dict[str, ]):
        pull_ops_used = False
        pull_ops = {}

        for i in range(len(patch)):
            operation = patch[i]
            path = operation["path"]
            if operation["op"] == "remove" and JsonPatchTranslator.path_is_array(path):
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