from django.db import models
from bson import ObjectId

class Permissions(models.Model):
    def __init__(self, _id: ObjectId, is_public: bool, permitted: list[str], campaign: str, object: str):
        self._id = _id
        self.is_public = is_public
        self.permitted = permitted
        self.campaign = campaign
        self.object = object