from datetime import datetime
from typing import List
import pymongo
from bson import ObjectId
from django.contrib.auth.models import AbstractBaseUser

client = pymongo.MongoClient('mongodb://admin:abc123!@localhost')
db = client['admin']
collection = db["profiles"]

profile_schema = {
    'userId': {'type': 'string', 'required': True},
    'displayName': {'type': 'string', 'required': True},
    'imageUrl': {'type': 'string', 'required': True},
    'hasSeenFPSplash': {'type': 'boolean', 'required': True},
    'hasSeenKSSplash': {'type': 'boolean', 'required': True},
    'groups': {'type': 'list', 'schema': {'type': 'string'}, 'required': True},
    'createdAt': {'type': 'datetime', 'required': True},
    'updatedAt': {'type': 'datetime', 'required': True},
}


class Profile:
    def __init__(self, userId: str, displayName: str, imageUrl: str, hasSeenFPSplash: bool, hasSeenKSSplash: bool, groups: List[str]):
        self.userId = userId
        self.displayName = displayName
        self.imageUrl = imageUrl
        self.hasSeenFPSplash = hasSeenFPSplash
        self.hasSeenKSSplash = hasSeenKSSplash
        self.groups = groups
        self.createdAt = datetime.utcnow()
        self.updatedAt = datetime.utcnow()