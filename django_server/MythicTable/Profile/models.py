from bson import ObjectId
from django.db import models

profile_schema = {
    '_id': {'type': 'objectid'},
    'user_id': {'type': 'string', 'required': True},
    'display_name': {'type': 'string', 'required': True},
    'image_url': {'type': 'string', 'required': True},
    'has_seen_FP_splash': {'type': 'boolean', 'required': True},
    'has_seen_KS_splash': {'type': 'boolean', 'required': True},
    'groups': {'type': 'list', 'schema': {'type': 'string'}, 'required': True}
}


class Profile(models.Model):
    def __init__(self, _id: ObjectId, user_id: str, display_name: str, image_url: str, has_seen_FP_splash: bool, has_seen_KS_splash: bool, groups: list[str]):
        self._id = _id
        self.user_id = user_id
        self.display_name = display_name
        self.image_url = image_url
        self.has_seen_FP_splash = has_seen_FP_splash
        self.has_seen_KS_splash = has_seen_KS_splash
        self.groups = groups