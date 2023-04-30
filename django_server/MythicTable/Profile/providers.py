from .exceptions import ProfileNotFoundException, ProfileInvalidException
from .models import Profile
from .serializers import ProfileDBSerializer
import pymongo
from bson import ObjectId
from MythicTable.providers import MongoDbProvider

class MongoDbProfileProvider(MongoDbProvider):
    def __init__(self, client=None, db_name=None):
        super().__init__(client, db_name)
        self.profile_collection = self.db['profiles']

    # get using the userId
    def get_by_user_id(self, user_id: str):
        # Define the filter
        filter = {"UserId": user_id}
        # Find the first document that matches the filter
        dto = self.profile_collection.find_one(filter)
        if dto is None:
            message = f"Cannot find user by id: {user_id}"
            raise ProfileNotFoundException(message)
        # Deserialization
        serializer = ProfileDBSerializer(data=dto)
        if not serializer.is_valid():
            message = f"The profile associated with user: '{user_id}' stored in the DB is not valid; {serializer.errors}"
            raise ProfileInvalidException(message)
        profile = serializer.create(serializer.validated_data)
        return profile

    # get using the mongoDB Object id
    def get(self, profile_id: str):
        # Define the filter
        filter = {"_id": ObjectId(profile_id)}
        cursor = self.profile_collection.find({})
        # Find the first document that matches the filter
        dto = self.profile_collection.find_one(filter)
        if dto is None:
            message = f"Cannot find user: {profile_id}"
            raise ProfileNotFoundException(message)
        # Deserialization
        serializer = ProfileDBSerializer(data=dto)
        if serializer.is_valid():
            profile = serializer.create(serializer.validated_data)
            return profile

    
    # get all the profile objects
    def get_list(self, _ids: list[ObjectId]):
        profiles = []
        for _id in _ids:
            # Define the filter
            filter = {"_id": _id}
            # Find the first document that matches the filter
            dto = self.profile_collection.find_one(filter)
            if dto is None:
                message = f"Cannot find user: {_id}"
                raise ProfileNotFoundException(message)
            # Deserialization
            serializer = ProfileDBSerializer(data=dto)
            if serializer.is_valid():
                profiles.append(serializer.create(serializer.validated_data))
        return profiles
        
    def create(self, profile: Profile):
        if profile == None:
            message = "The profile is None"
            raise ProfileInvalidException(message)
        # Serialization
        serializer = ProfileDBSerializer(profile)
        newProfile = serializer.data
        del newProfile['_id']
        result = self.profile_collection.insert_one(newProfile)
        if (not result.acknowledged):
            message = f"Unable to create profile, result {result}"
            raise ProfileInvalidException(message)
        profile._id = result.inserted_id
        return profile
    
    def update(self, profile: Profile):
        if profile == None:
            message = "The profile is None"
            raise ProfileInvalidException(message)
        if (profile._id == "" or profile._id == None):
            message = "The profile MUST have an id"
            raise ProfileInvalidException(message)
        # Define the filter
        filter = {'_id': profile._id}
        # Serialization
        serializer = ProfileDBSerializer(profile)
        result = self.profile_collection.replace_one(filter, serializer.data)
        if (not result.acknowledged or
            result.matched_count == 0):
            message = f"Unable to update profile: {profile._id}, result: {result}"
            raise ProfileNotFoundException(message)
        return profile
    
    def delete(self, _id: ObjectId):
        # Define the filter
        filter = {'_id': _id}
        result = self.profile_collection.delete_one(filter)
        if (not result.acknowledged or
            result.deleted_count == 0):
            message = f"Unable to delete profile: {_id}, result: {result}"
            raise ProfileNotFoundException(message)