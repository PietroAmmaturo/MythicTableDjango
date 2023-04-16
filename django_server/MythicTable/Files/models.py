from datetime import datetime
from bson import ObjectId
from django.db import models

class File(models.Model):
    def __init__(self, _id: ObjectId, reference: str, path: str, name: str, 
                 user: str, url: str, md5: str):
        self._id = _id
        self.reference = reference
        self.path = path
        self.name = name
        self.user = user
        self.url = url
        self.md5 = md5