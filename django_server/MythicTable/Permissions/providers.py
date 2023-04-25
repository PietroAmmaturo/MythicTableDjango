from .exceptions import PermissionException, UnauthorizedException
from .models import Permissions
from .serializers import PermissionsDBSerializer
import pymongo
from bson import ObjectId
from MythicTable.providers import MongoDbProvider

class MongoDbPermissionProvider(MongoDbProvider):
    def __init__(self, client=None, db_name=None):
        super().__init__(client, db_name)
        self.permission_collection = self.db['permissions']

    def create(self, campaign_id: str, object_id: str, permissions: Permissions):
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
        result = self.permission_collection.insert_one(newProfile)
        if (not result.acknowledged):
            message = f"Unable to create profile, result {result}"
            raise PermissionException(message)
        permissions._id = result.inserted_id
        return permissions
    
    def get_list(self, campaign_id: str):
        filter = {"Campaign" : campaign_id}
        dtos = self.permission_collection.find(filter)
        if dtos is None:
            message = f"Cannot find permissions for campaign: {campaign_id}"
            raise PermissionException(message)
        # Deserialization
        serializer = PermissionsDBSerializer(data=dtos, many=True)
        if serializer.is_valid():
            permissions = serializer.create(serializer.validated_data)
            return permissions
        
    def get(self, campaign_id: str, object_id: str):
        filter = {"$and": [{"Campaign": campaign_id}, {"Object": object_id}]}
        dto = self.permission_collection.find_one(filter)
        if dto is None:
            message = f"Cannot find permissions for item: {object_id} in campaign: {campaign_id}"
            raise PermissionException(message)
        # Deserialization
        serializer = PermissionsDBSerializer(data=dto)
        if serializer.is_valid():
            permissions = serializer.create(serializer.validated_data)
            return permissions
        
    def update(self, campaign_id: str, permissions: Permissions):
        if (not permissions) or len(permissions) == 0:
            message = f"Could not update permission. Missing Id.: {permissions}"
            raise PermissionException(message)
        filter = {"$and": [{"Campaign": campaign_id}, {"_id": permissions._id}]}
        serializer = PermissionsDBSerializer(permissions)
        result = self.permission_collection.replace_one(filter, serializer.data)
        if (not result.acknowledged):
            message = f"Unable to update permissions, result {result}"
            raise PermissionException(message)
        return permissions
    
    def delete(self, campaign_id: str, permissions_id: str):
        filter = {"$and": [{"Campaign": campaign_id}, {"_id": permissions_id}]}
        result = self.permission_collection.delete_one(filter)
        if (not result.acknowledged):
            message = f"Unable to delete permissions, result {result}"
            raise PermissionException(message)
        if (result.deleted_count == 0):
            message = f"Could not delete permission '{permissions_id}' in campaign '{campaign_id}'"
            raise PermissionException(message)
        return result.deleted_count

    # is_authorized is strange
    def is_authorized(self, user_id: str, campaign_id: str, object_id: str):
        try:
            permissions = self.get(campaign_id, object_id)
            return permissions != None
        except PermissionException:
            return True