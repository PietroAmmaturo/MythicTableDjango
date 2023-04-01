from .exceptions import ProfileNotFoundException, ProfileInvalidException
from .models import Profile
from .serializers import ProfileDBSerializer
import pymongo
from bson import ObjectId

client = pymongo.MongoClient('mongodb://admin:abc123!@localhost')
for dbn in client.list_database_names():
    print("db", dbn)
    db = client[dbn]
    for coll in db.list_collection_names():
        print("coll", coll)
db = client['admin']
collection = db["profiles"]

class MongoDbProfileProvider:
    # get using the userId
    def get_by_user_id(user_id: str):
        # Define the filter
        filter = {"UserId": user_id}
        # Find the first document that matches the filter
        dto = collection.find_one(filter)
        if dto is None:
            message = f"Cannot find user by id: {user_id}"
            raise ProfileNotFoundException(message)
        # Deserialization
        serializer = ProfileDBSerializer(data=dto)
        if not serializer.is_valid():
            message = f"The profile associated with user: '{user_id}' stored in the DB is not valid; {serializer.errors}"
            raise ProfileInvalidException(message)
        profile = serializer.create()
        return profile

    # get using the mongoDB Object id
    def get(_id: ObjectId):
        # Define the filter
        filter = {"_id": _id}
        cursor = collection.find({})
        # Find the first document that matches the filter
        dto = collection.find_one(filter)
        if dto is None:
            message = f"Cannot find user: {_id}"
            raise ProfileNotFoundException(message)
        # Deserialization
        serializer = ProfileDBSerializer(data=dto)
        if serializer.is_valid():
            profile = serializer.create()
            return profile

    
    # get all the profile objects
    def get(_ids: list[ObjectId]):
        profiles = []
        for _id in _ids:
            # Define the filter
            filter = {"_id": _id}
            # Find the first document that matches the filter
            dto = collection.find_one(filter)
            if dto is None:
                message = f"Cannot find user: {_id}"
                raise ProfileNotFoundException(message)
            # Deserialization
            serializer = ProfileDBSerializer(data=dto)
            if serializer.is_valid():
                profiles.append(serializer.create())
        return profiles
        
    def create(profile: Profile):
        if profile == None:
            message = "The profile is None"
            raise ProfileInvalidException(message)
        # Serialization
        serializer = ProfileDBSerializer(profile)
        newProfile = serializer.data
        del newProfile['_id']
        result = collection.insert_one(newProfile)
        if (not result.acknowledged):
            message = f"Unable to create profile, result {result}"
            raise ProfileInvalidException(message)
        profile._id = result.inserted_id
        return profile
    
    def update(profile: Profile):
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
        result = collection.replace_one(filter, serializer.data)
        if (not result.acknowledged or
            result.matched_count == 0):
            message = f"Unable to update profile: {profile._id}, result: {result}"
            raise ProfileNotFoundException(message)
        return profile
    
    def delete(_id: ObjectId):
        # Define the filter
        filter = {'_id': _id}
        result = collection.delete_one(filter)
        if (not result.acknowledged or
            result.deleted_count == 0):
            message = f"Unable to delete profile: {_id}, result: {result}"
            raise ProfileNotFoundException(message)