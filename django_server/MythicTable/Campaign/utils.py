from datetime import datetime
from pymongo.results import InsertOneResult
import bson
from pymongo.collection import Collection
from pymongo.database import Database
from .generators import CampaignJoinIdGenerator
from .models import Campaign
from .exceptions import CampaignInvalidException, CampaignNotFoundException
from .providers import MongoDbCampaignProvider
from Collections.providers import MongoDbCollectionProvider
import json

class CampaignUtils:
    @staticmethod
    def create_default_campaign(
            owner: str,
            campaign: Campaign,
        ):
        if campaign is None:
            raise CampaignInvalidException("Invalid campaign object: null")
        campaign.join_id = CampaignUtils.generate_join_id()
        campaign.owner = owner

        created_campaign = MongoDbCampaignProvider.create(campaign)

        created_collection = MongoDbCollectionProvider.create_by_campaign(
            user_id = str(owner), 
            collection = "maps", 
            campaign_id = str(created_campaign._id), 
            j_object = MapUtils.create_map("/static/assets/tutorial/thank-you.jpg", 37, 25, 140)
        )

        return created_campaign

    @staticmethod
    def generate_join_id():
        join_id = CampaignJoinIdGenerator.generate()
        numAttempts = 0
        while numAttempts < 5:
            try:
                found = MongoDbCampaignProvider.get_by_join_id(join_id=join_id)
                join_id = CampaignJoinIdGenerator.generate()
                print(join_id)
                numAttempts += 1
            except CampaignNotFoundException:
                return join_id
        raise Exception("Could not find a Join Id in a reasonable time. Try again later.")

class MapUtils:
    @staticmethod
    def create_map(image, q, r, size=50):
        json_data = f"""{{
            "map": {{ "stage": "." }},
            "stage": {{
                "grid": {{ "type": "square", "size": {size} }},
                "bounds": {{
                    "nw": {{ "q": 0, "r": 0 }},
                    "se": {{ "q": {q}, "r": {r} }}
                }},
                "color": "#223344",
                "elements": [ {{
                    "id": "background",
                    "asset": {{ "kind": "image", "src": "{image}" }},
                    "pos": {{ "q": 0, "r": 0, "pa": "00" }}
                }}
                ]
            }}
        }}"""
        print(json_data.strip())  # print 20 characters before and after the error position
        return json.loads(json_data.strip())

    @staticmethod
    def create_player(map_id, user_id):
        return json.loads(f"""{{
            "mapId": "{map_id}",
            "userId": "{user_id}",
        }}""")
    
class CharacterUtil:
    @staticmethod
    def create_collection_character(id, image, name, description, border_mode, border_color, token_size=2, icon=None):
        return json.loads(f"""{{
            "_character_version": 1,
            "_id": ObjectId("{id}"),
            "image": "/static/assets/{image}.png",
            "name": "{name}",
            "description": "{description}",
            "borderMode": "{border_mode}",
            "borderColor": "{border_color}",
            "tokenSize": {token_size},
        }}""", object_hook=bson.json_util.object_hook)

    @staticmethod
    def create_collection_token(id, image, name, description, border_mode, border_color, token_id, map_id, x, y, background_color, token_size=2):
        return json.loads(f"""{{
            "_character_version": 1,
            "_token_version": 1,
            "_id": ObjectId("{token_id}"),
            "image": "/static/assets/{image}.png",
            "name": "{name}",
            "description": "{description}",
            "borderMode": "{border_mode}",
            "borderColor": "{border_color}",
            "tokenSize": {token_size},
            "mapId": "{map_id}",
            "pos": {{
                "q": {x},
                "r": {y}
            }},
            "backgroundColor": "{background_color}",
            "character": ObjectId("{id}")
        }}""", object_hook=bson.json_util.object_hook)