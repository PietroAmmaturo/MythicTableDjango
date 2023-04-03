from datetime import datetime
from bson import ObjectId
from django.db import models

class Player:
    def __init__(self, _id: ObjectId, name: str):
        self._id = _id
        self.name = name

class Campaign(models.Model):
    def __init__(self, _id: ObjectId, join_id: str, owner: str, name: str,
                 description: str, image_url: str, created: datetime, 
                 last_modified: datetime, players=list[Player], tutorial_campaign=False):
        self._id = _id
        self.join_id = join_id
        self.owner = owner
        self.name = name
        self.description = description
        self.image_url = image_url
        self.created = created
        self.last_modified = last_modified
        self.players = players
        self.tutorial_campaign = tutorial_campaign