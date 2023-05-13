from datetime import datetime
from bson import ObjectId
from django.db import models
from Textparsing.models import Chat

class Player(models.Model):
    def __init__(self, _id: ObjectId, name: str):
        self._id = _id
        self.name = name

class Message(models.Model):
    def __init__(self, _id: ObjectId, timestamp: int, user_id: str, display_name: str,
                 session_id: str, message: str, result: Chat, client_id: str,
                 context: dict[str, object]):
        self._id: ObjectId = _id
        self.timestamp: int = timestamp
        self.user_id: str = user_id
        self.display_name: str = display_name
        self.session_id: str = session_id
        self.message: str = message
        self.result: Chat = result
        self.client_id: str = client_id
        self.context: dict[str, object] = context

    def __eq__(self, other):
        if not isinstance(other, Message):
            return False
        return self.Message == other.Message

    def __hash__(self):
        return hash((self.Id, self.Timestamp, self.UserId, self.DisplayName,
                     self.SessionId, self.Message, self.Result))

class MessageContainer(models.Model):
    def __init__(self, _id: ObjectId, messages: list[Message]):
        self._id = _id
        self.messages = messages

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