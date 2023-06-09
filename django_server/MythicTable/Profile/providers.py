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

    def get_by_user_id(self, user_id: str):
        """
        Retrieve a profile by user ID.

        Args:
            user_id (str): The ID of the user.

        Returns:
            Profile: The retrieved profile.

        Raises:
            ProfileNotFoundException: If the profile is not found.
            ProfileInvalidException: If the retrieved profile is not valid.
        """        
        filter = {"UserId": user_id}
        dto = self.profile_collection.find_one(filter)
        if dto is None:
            message = f"Cannot find user by id: {user_id}"
            raise ProfileNotFoundException(message)
        serializer = ProfileDBSerializer(data=dto)
        if not serializer.is_valid():
            message = f"The profile associated with user: '{user_id}' stored in the DB is not valid; {serializer.errors}"
            raise ProfileInvalidException(message)
        profile = serializer.create(serializer.validated_data)
        return profile

    def get(self, profile_id: str):
        """
        Retrieve a profile by MongoDB Object ID.

        Args:
            profile_id (str): The ID of the profile.

        Returns:
            Profile: The retrieved profile.

        Raises:
            ProfileNotFoundException: If the profile is not found.
        """        
        filter = {"_id": ObjectId(profile_id)}
        cursor = self.profile_collection.find({})
        dto = self.profile_collection.find_one(filter)
        if dto is None:
            message = f"Cannot find user: {profile_id}"
            raise ProfileNotFoundException(message)
        serializer = ProfileDBSerializer(data=dto)
        if serializer.is_valid():
            profile = serializer.create(serializer.validated_data)
            return profile

    def get_list(self, _ids: list[ObjectId]):
        """
        Retrieve a list of profiles by their MongoDB Object IDs.

        Args:
            _ids (list[ObjectId]): List of profile IDs.

        Returns:
            list[Profile]: List of retrieved profiles.

        Raises:
            ProfileNotFoundException: If any profile is not found.
        """
        profiles = []
        for _id in _ids:
            filter = {"_id": _id}
            dto = self.profile_collection.find_one(filter)
            if dto is None:
                message = f"Cannot find user: {_id}"
                raise ProfileNotFoundException(message)
            serializer = ProfileDBSerializer(data=dto)
            if serializer.is_valid():
                profiles.append(serializer.create(serializer.validated_data))
        return profiles
        
    def create(self, profile: Profile):
        """
        Create a new profile.

        Args:
            profile (Profile): The profile object to create.

        Returns:
            Profile: The created profile.

        Raises:
            ProfileInvalidException: If the profile is None or creation fails.
        """
        if profile == None:
            message = "The profile is None"
            raise ProfileInvalidException(message)
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
        """
        Update an existing profile.

        Args:
            profile (Profile): The profile object to update.

        Returns:
            Profile: The updated profile.

        Raises:
            ProfileInvalidException: If the profile is None or has no ID.
            ProfileNotFoundException: If the profile is not found or the update fails.
        """
        if profile == None:
            message = "The profile is None"
            raise ProfileInvalidException(message)
        if (profile._id == "" or profile._id == None):
            message = "The profile MUST have an id"
            raise ProfileInvalidException(message)
        filter = {'_id': profile._id}
        serializer = ProfileDBSerializer(profile)
        result = self.profile_collection.replace_one(filter, serializer.data)
        if (not result.acknowledged or
            result.matched_count == 0):
            message = f"Unable to update profile: {profile._id}, result: {result}"
            raise ProfileNotFoundException(message)
        return profile
    
    def delete(self, _id: ObjectId):
        """
        Delete a profile by its MongoDB Object ID.

        Args:
            _id (ObjectId): The ID of the profile to delete.

        Raises:
            ProfileNotFoundException: If the profile is not found or the deletion fails.
        """
        filter = {'_id': _id}
        result = self.profile_collection.delete_one(filter)
        if (not result.acknowledged or
            result.deleted_count == 0):
            message = f"Unable to delete profile: {_id}, result: {result}"
            raise ProfileNotFoundException(message)