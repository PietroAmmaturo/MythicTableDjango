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

    def create(self, profile_id: str, collection: str, item: dict) -> dict:
        """
        Creates a new item in the specified collection for the given profile ID.
        Inserts the item into the collection and returns the inserted item.

        Args:
            profile_id (str): The ID of the user profile.
            collection (str): The name of the collection.
            item (dict): The item to be created.

        Returns:
            dict: The created item.

        Raises:
            MythicTableException: If the item cannot be created.
        """
        item[self.USER_ID_FIELD] = profile_id
        item[self.COLLECTION_FIELD] = collection
        result = self.collection_collection.insert_one(item)
        item['_id'] = str(result.inserted_id)
        return item

    def get_list(self, profile_id: str, collection: str) -> list[dict]:
        """
        Retrieves a list of items from the specified collection for the given profile ID.
        Returns the list of items.

        Args:
            profile_id (str): The ID of the user profile.
            collection (str): The name of the collection.

        Returns:
            list[dict]: The list of items.

        Raises:
            MythicTableException: If the collection cannot be found.
        """
        results = list(self.collection_collection.find(
            {self.COLLECTION_FIELD: collection, self.USER_ID_FIELD: profile_id}
        ))
        json_results = [self._bson_to_json(result) for result in results]
        if not json_results:
            message = f"Could not find collection '{collection}' for user '{profile_id}'"
            raise MythicTableException(message)
        return json_results

    def get(self, profile_id: str, collection_id: str, item_id: str) -> dict:
        """
        Get an item from a collection.

        Args:
            profile_id (str): The ID of the user profile.
            collection_id (str): The ID of the collection.
            item_id (str): The ID of the item.

        Returns:
            dict: The retrieved item.

        Raises:
            NotFound: If the item cannot be found.
        """
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
        """
        Delete an item from a collection.

        Args:
            profile_id (str): The ID of the user profile.
            collection_id (str): The ID of the collection.
            item_id (str): The ID of the item.

        Returns:
            int: The number of deleted items.

        Raises:
            MythicTableException: If the item cannot be deleted.
        """
        result = self.collection_collection.delete_one(
            {self.COLLECTION_FIELD: collection_id, self.USER_ID_FIELD: profile_id, '_id': ObjectId(item_id)}
        )
        if not result.deleted_count:
            message = f"Could not delete item '{item_id}' in collection '{collection_id}' for user '{profile_id}'"
            raise MythicTableException(message)
        return result.deleted_count

    def update(self, profile_id: str, collection_id: str, item_id: str, patch: dict) -> int:
        """
        Update an item in a collection.

        Args:
            profile_id (str): The ID of the user profile.
            collection_id (str): The ID of the collection.
            item_id (str): The ID of the item.
            patch (dict): The patch to be applied.

        Returns:
            int: The number of modified items.

        Raises:
            MythicTableException: If the item cannot be updated.
        """
        json_patch = self._bson_to_json(patch)
        result = self.collection_collection.update_one(
            {self.COLLECTION_FIELD: collection_id, self.USER_ID_FIELD: profile_id, '_id': ObjectId(item_id)},
            {'$set': json_patch}
        )
        if not result.modified_count:
            message = f"Could not update item '{item_id}' in collection '{collection_id}' for user '{profile_id}'"
            raise MythicTableException(message)
        return result.modified_count

    def create_by_campaign(self, profile_id: str, collection: str, campaign_id: str, item: str) -> str:
        """
        Create a new item in a collection associated with a campaign.

        Args:
            profile_id (str): The ID of the user profile.
            collection (str): The name of the collection.
            campaign_id (str): The ID of the campaign.
            item (str): The item to be created.

        Returns:
            str: The created item.

        Raises:
            MythicTableException: If an error occurs during creation.
        """
        if '_id' in item:
            del item['_id']
        item[self.USER_ID_FIELD] = profile_id
        item[self.COLLECTION_FIELD] = collection
        item[self.CAMPAIGN_FIELD] = campaign_id
        result = self.collection_collection.insert_one(item)
        item["_id"] = result.inserted_id
        inserted = self.collection_collection.find_one({"_id" : ObjectId(str(result.inserted_id))})
        return self._bson_to_json(inserted)

    def get_list_by_campaign(self, collection: str, campaign_id: str) -> list[str]:
        """
        Get a list of items from a collection associated with a campaign.

        Args:
            collection (str): The name of the collection.
            campaign_id (str): The ID of the campaign.

        Returns:
            list[str]: The list of items.

        Raises:
            MythicTableException: If the collection cannot be found.
        """
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
        """
        Get an item from a collection associated with a campaign.

        Args:
            collection_id (str): The ID of the collection.
            campaign_id (str): The ID of the campaign.
            item_id (str): The ID of the item.

        Returns:
            list[str]: The retrieved item.

        Raises:
            NotFound: If the item cannot be found.
        """
        results = list(self.collection_collection.find({
            self.COLLECTION_FIELD: collection_id,
            self.CAMPAIGN_FIELD: campaign_id,
            "_id": ObjectId(item_id)
        }))
        item = results[0] if results else None
        if item:
            return self._bson_to_json(item)
        message = f"Could not find item '{item_id}' in collection '{collection_id}' for campaign '{campaign_id}'"
        raise MythicTableException(message)

    def update_by_campaign(self, collection: str, campaign_id: str, item_id: str, patch: list[dict[str, str]]) -> int:
        """
        Update an item in a collection associated with a campaign.

        Args:
            collection (str): The name of the collection.
            campaign_id (str): The ID of the campaign.
            item_id (str): The ID of the item.
            patch (list[dict[str, str]]): The patch to be applied.

        Returns:
            int: The number of modified items.

        Raises:
            MythicTableException: If the item cannot be updated.
        """
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
        """
        Delete an item from a collection associated with a campaign.

        Args:
            collection (str): The name of the collection.
            campaign_id (str): The ID of the campaign.
            item_id (str): The ID of the item.

        Returns:
            int: The number of deleted items.

        Raises:
            MythicTableException: If the item cannot be deleted.
        """
        deleted = self.collection_collection.delete_one({
            self.COLLECTION_FIELD: collection,
            self.CAMPAIGN_FIELD: campaign_id,
            "_id": ObjectId(item_id)
        })
        if deleted.deleted_count == 0:
            message = f"Could not delete item '{item_id}' in collection '{collection}' for campaign '{campaign_id}'"
            raise MythicTableException(message)
        return deleted.deleted_count

    def delete_all_by_campaign(self, campaign_id: str) -> int:
        """
        Delete all items from a collection associated with a campaign.

        Args:
            campaign_id (str): The ID of the campaign.

        Returns:
            int: The number of deleted items.

        Raises:
            MythicTableException: If the items cannot be deleted.
        """
        deleted = self.collection_collection.delete_many({
            self.CAMPAIGN_FIELD: campaign_id
        })
        if deleted.deleted_count == 0:
            message = f"Could not delete items for campaign '{campaign_id}'"
            raise MythicTableException(message)
        return deleted.deleted_count
    
    def internal_update(self, patch: list[dict[str, str]], filter: dict[str, ]) -> int:
        """
        Apply an internal update to an item in the collection.

        Args:
            patch (list[dict[str, str]]): The patch to be applied.
            filter (dict[str, ]): The filter criteria for the update.

        Returns:
            int: The number of modified items.
        """
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
        return results.modified_count

    def internal_pull(self, patch: list[dict[str, str]], filter: dict[str, ]):
        """
        Apply an internal pull operation to an item in the collection.

        Args:
            patch (list[dict[str, str]]): The patch to be applied.
            filter (dict[str, ]): The filter criteria for the update.
        """
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
        """
        Convert a BSON document to a JSON document.

        Args:
            bson: The BSON document.

        Returns:
            dict: The JSON document.
        """
        json_dict = {}
        for key, value in bson.items():
            if isinstance(value, ObjectId):
                json_dict[key] = str(value)
            elif isinstance(value, dict):
                json_dict[key] = self._bson_to_json(value)
            else:
                json_dict[key] = value
        return json_dict