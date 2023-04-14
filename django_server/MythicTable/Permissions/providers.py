from .exceptions import PermissionException, UnauthorizedException
from .models import Permissions
from .serializers import PermissionsDBSerializer
import pymongo
from bson import ObjectId

client = pymongo.MongoClient('mongodb://admin:abc123!@localhost')
for dbn in client.list_database_names():
    print("db", dbn)
    db = client[dbn]
    for coll in db.list_collection_names():
        print("coll", coll)
db = client['admin']
permissions_collection = db["permissions"]

class MongoDbPermissionsProvider:
    def create(campaign_id: str, object_id: str, permissions: Permissions):
        if (not campaign_id) or len(campaign_id) == 0:
            message = f"Could not create permission invalid campaign id: {campaign_id}"
            raise PermissionException(message)
        if (not object_id) or len(object_id) == 0:
            message = f"Could not create permission invalid object id: {campaign_id}"
            raise PermissionException(message)
        permissions.campaign = campaign_id
        permissions.object = object_id
        # Serialization
        serializer = PermissionsDBSerializer(permissions)
        newProfile = serializer.data
        del newProfile['_id']
        result = permissions_collection.insert_one(newProfile)
        if (not result.acknowledged):
            message = f"Unable to create profile, result {result}"
            raise PermissionException(message)
        permissions._id = result.inserted_id
        return permissions
    
    def get_list(campaign_id: str):
        filter = {"Campaign" : campaign_id}
        dtos = permissions_collection.find(filter)
        if dtos is None:
            message = f"Cannot find permissions for campaign: {campaign_id}"
            raise PermissionException(message)
        # Deserialization
        serializer = PermissionsDBSerializer(data=dtos, many=True)
        if serializer.is_valid():
            permissions = serializer.create(serializer.validated_data)
            return permissions
        
    def get(campaign_id: str, object_id: str):
        filter = {"$and": [{"Campaign": campaign_id}, {"Object": object_id}]}
        dto = permissions_collection.find_one(filter)
        if dto is None:
            message = f"Cannot find permissions for item: {object_id} in campaign: {campaign_id}"
            raise PermissionException(message)
        # Deserialization
        serializer = PermissionsDBSerializer(data=dto)
        if serializer.is_valid():
            permissions = serializer.create(serializer.validated_data)
            return permissions
        
    def update(campaign_id: str, permissions: Permissions):
        if (not permissions) or len(permissions) == 0:
            message = f"Could not update permission. Missing Id.: {permissions}"
            raise PermissionException(message)
        filter = {"$and": [{"Campaign": campaign_id}, {"_id": permissions._id}]}
        serializer = PermissionsDBSerializer(permissions)
        result = permissions_collection.replace_one(filter, serializer.data)
        if (not result.acknowledged):
            message = f"Unable to update permissions, result {result}"
            raise PermissionException(message)
        return permissions
    
    def delete(campaign_id: str, permissions_id: str):
        filter = {"$and": [{"Campaign": campaign_id}, {"_id": permissions_id}]}
        result = permissions_collection.delete_one(filter)
        if (not result.acknowledged):
            message = f"Unable to delete permissions, result {result}"
            raise PermissionException(message)
        if (result.deleted_count == 0):
            message = f"Could not delete permission '{permissions_id}' in campaign '{campaign_id}'"
            raise PermissionException(message)
        return result.deleted_count

    # is_authorized is strange
    def is_authorized(user_id: str, campaign_id: str, object_id: str):
        try:
            permissions = MongoDbPermissionsProvider.get(campaign_id, object_id)
            return permissions != None
        except PermissionException:
            return True