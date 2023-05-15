from .exceptions import PermissionException, UnauthorizedException
from .models import Permission
from .serializers import PermissionDBSerializer
import pymongo
from bson import ObjectId
from MythicTable.providers import MongoDbProvider

class MongoDbPermissionProvider(MongoDbProvider):
    def __init__(self, client=None, db_name=None):
        super().__init__(client, db_name)
        self.permission_collection = self.db['permissions']

    def create(self, campaign_id: str, object_id: str, permission: Permission) -> Permission:
        if (not campaign_id) or len(campaign_id) == 0:
            message = f"Could not create permission invalid campaign id: {campaign_id}"
            raise PermissionException(message)
        if (not object_id) or len(object_id) == 0:
            message = f"Could not create permission invalid object id: {campaign_id}"
            raise PermissionException(message)
        permission.campaign = campaign_id
        permission.object = object_id
        # Serialization
        serializer = PermissionDBSerializer(permission)
        newProfile = serializer.data
        del newProfile['_id']
        result = self.permission_collection.insert_one(newProfile)
        if (not result.acknowledged):
            message = f"Unable to create profile, result {result}"
            raise PermissionException(message)
        permission._id = result.inserted_id
        return permission
    
    def get_list(self, campaign_id: str) -> list[Permission]:
        filter = {"Campaign" : campaign_id}
        dtos = self.permission_collection.find(filter)
        if dtos is None:
            message = f"Cannot find permissions for campaign: {campaign_id}"
            raise PermissionException(message)
        # Deserialization
        serializer = PermissionDBSerializer(data=dtos, many=True)
        if serializer.is_valid():
            permissions = serializer.create(serializer.validated_data)
            return permissions
        
    def get(self, campaign_id: str, object_id: str) -> Permission:
        filter = {"$and": [{"Campaign": campaign_id}, {"Object": object_id}]}
        dto = self.permission_collection.find_one(filter)
        if dto is None:
            message = f"Cannot find permission for item: {object_id} in campaign: {campaign_id}"
            raise PermissionException(message)
        # Deserialization
        serializer = PermissionDBSerializer(data=dto)
        if serializer.is_valid():
            permission = serializer.create(serializer.validated_data)
            return permission
        
    def update(self, campaign_id: str, permission: Permission) -> Permission:
        if (not permission._id):
            message = f"Could not update permission. Missing Id.: {permission}"
            raise PermissionException(message)
        filter = {"$and": [{"Campaign": campaign_id}, {"_id": permission._id}]}
        serializer = PermissionDBSerializer(permission)
        result = self.permission_collection.replace_one(filter, serializer.data)
        if (not result.acknowledged):
            message = f"Unable to update permission, result {result}"
            raise PermissionException(message)
        return permission
    
    def delete(self, campaign_id: str, permission_id: str) -> int:
        filter = {"$and": [{"Campaign": campaign_id}, {"_id": permission_id}]}
        result = self.permission_collection.delete_one(filter)
        if (not result.acknowledged):
            message = f"Unable to delete permission, result {result}"
            raise PermissionException(message)
        if (result.deleted_count == 0):
            message = f"Could not delete permission '{permission_id}' in campaign '{campaign_id}'"
            raise PermissionException(message)
        return result.deleted_count

    # is_authorized is strange
    def is_authorized(self, profile_id: str, campaign_id: str, object_id: str) -> bool:
        try:
            permission = self.get(campaign_id, object_id)
            return permission != None
        except PermissionException:
            return True