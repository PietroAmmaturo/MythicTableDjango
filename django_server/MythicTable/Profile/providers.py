from datetime import datetime
from typing import List
import pymongo
from bson import ObjectId
from .exceptions import ProfileNotFoundException

client = pymongo.MongoClient('mongodb://admin:abc123!@localhost')
db = client['admin']
collection = db["profiles"]

class MongoDbProfileProvider:
    def getByUserId(userId):
        # Define the filter
        filter = {"UserId": userId}
        # Find the first document that matches the filter
        dto = collection.find_one(filter)
        if dto is not None:
            return dto
        message = f"Cannot find user by id: {userId}"
        #logger.error(message)
        raise ProfileNotFoundException(message)