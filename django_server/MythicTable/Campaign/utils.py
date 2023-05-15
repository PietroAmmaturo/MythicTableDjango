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
import datetime
import random

class CampaignUtils:
    @staticmethod
    def create_default_campaign(
            owner: str,
            campaign: Campaign,
            campaign_provider: MongoDbCampaignProvider,
            collection_provider: MongoDbCollectionProvider,
        ):
        if campaign is None:
            raise CampaignInvalidException("Invalid campaign object: null")
        campaign.join_id = CampaignUtils.generate_join_id(campaign_provider=campaign_provider)
        campaign.owner = owner

        created_campaign = campaign_provider.create(campaign)

        created_collection = collection_provider.create_by_campaign(
            profile_id = str(owner), 
            collection = "maps", 
            campaign_id = str(created_campaign._id), 
            item = MapUtils.create_map("/static/assets/tutorial/thank-you.jpg", 37, 25, 140)
        )

        return created_campaign

    @staticmethod
    def generate_join_id(campaign_provider: MongoDbCampaignProvider):
        join_id = CampaignJoinIdGenerator.generate()
        numAttempts = 0
        while numAttempts < 5:
            try:
                found = campaign_provider.get_by_join_id(join_id=join_id)
                join_id = CampaignJoinIdGenerator.generate()
                numAttempts += 1
            except CampaignNotFoundException:
                return join_id
        raise Exception("Could not find a Join Id in a reasonable time. Try again later.")

    def create_tutorial_campaign(campaign_provider: MongoDbCampaignProvider, collection_provider: MongoDbCollectionProvider, owner):
        campaign = Campaign(_id=None,
                            join_id=None,
                            owner=owner,
                            name="Tutorial Campaign",
                            tutorial_campaign=True,
                            description="A campaign designed to get you familiar with the features of MythicTable",
                            created=datetime.datetime.now(),
                            last_modified=datetime.datetime.now(),
                            image_url="/static/assets/tutorial/campaign-banner.jpg",
                            players=[])
        campaign = campaign_provider.create(campaign)

        # Create characters
        characters = [
            ("marc", "Marc", "Human fighter", "circle", "#000000", 2),
            ("sarah", "Sarah", "Elven wizard", "circle", "#1ba73e", 2),
            ("Redcap", "Redcap", "Goblin rogue", "circle", "#c02d0c", 1),
            ("Wolf", "Wolf", "", "circle", "#c02d0c", 3),
            ("Tauren", "Tauren", "", "circle", "#1ba73e", 3),
            ("marcOld", "Elf", "", "circle", "#3802b8", 2)
        ]
        created_characters = []
        for character in characters:
            c = collection_provider.create_by_campaign(
                str(owner),
                "characters",
                str(campaign._id),
                CharacterUtil.create_collection_character(character[0], character[1], character[2], character[3], character[4], character[5])
            )
            created_characters.append(c)

        # Create map1 using MapUtils.create_map()
        map1 = MapUtils.create_map("/static/assets/tutorial/basic-map-interactions.jpg", 37, 25, 140)
        map1["start"] = {"n": 2, "w": 2, "s": 12, "e": 18}
        map1 = collection_provider.create_by_campaign(str(owner), "maps", str(campaign._id), map1)

        # Create map2 using MapUtils.create_map()
        map2 = MapUtils.create_map("/static/assets/tutorial/drawing-tools-chat.jpg", 37, 25, 140)
        map2["start"] = {"n": 2, "w": 2, "s": 12, "e": 18}
        map2 = collection_provider.create_by_campaign(str(owner), "maps", str(campaign._id), map2)

        # Create map3 using MapUtils.create_map()
        map3 = MapUtils.create_map("/static/assets/tutorial/thank-you.jpg", 37, 25, 140)
        map3 = collection_provider.create_by_campaign(str(owner), "maps", str(campaign._id), map3)

        # Create tokens
        tokens = [
            ("marc", "Marc", "Human fighter", "circle", "#000000", str(created_characters[0]["_id"]), map1["_id"], 5, 7, None),
            ("sarah", "Sarah", "Elven wizard", "circle", "#1ba73e", str(created_characters[1]["_id"]), map1["_id"], 28, 19, None),
            ("Wolf", "Wolf", "Big bad wolf", "circle", "#c02d0c", str(created_characters[3]["_id"]), map1["_id"], 25, 6, None, 3),
            ("Redcap", "Goblin 1", "Goblin rogue", "circle", "#c02d0c", str(created_characters[2]["_id"]), map1["_id"], 27, 7, None, 1),
            ("Redcap", "Goblin 2", "Goblin rogue", "circle", "#c02d0c", str(created_characters[2]["_id"]), map1["_id"], 26, 8, None, 1),
            ("Redcap", "Goblin 3", "Goblin rogue", "circle", "#c02d0c", str(created_characters[2]["_id"]), map1["_id"], 24, 6, None, 1),
            ("sarah", "Sarah", "Elven wizard", "circle", "#1ba73e", str(created_characters[1]["_id"]), map2["_id"], 6, 6, None),
            ("Redcap", "Goblin 1", "Goblin rogue", "circle", "#c02d0c", str(created_characters[2]["_id"]), map2["_id"], 11, 6, None, 1),
            ("Redcap", "Goblin 2", "Goblin rogue", "circle", "#c02d0c", str(created_characters[2]["_id"]), map2["_id"], 11, 7, None, 1),
            ("Redcap", "Goblin 3", "Goblin rogue", "circle", "#c02d0c", str(created_characters[2]["_id"]), map2["_id"], 10, 6, None, 1),
            ("marcOld", "Marc", "Elven fighter", "circle", "#3802b8", str(created_characters[5]["_id"]), map2["_id"], 26, 7, None),
            ("Tauren", "Ogre", "Ogre mauler", "circle", "#1ba73e", str(created_characters[4]["_id"]), map2["_id"], 28, 6, None, 3)
        ]
        for token in tokens:
            collection_provider.create_by_campaign(
                str(owner),
                "tokens",
                str(campaign._id),
                CharacterUtil.create_collection_token(token[0], token[1], token[2], token[3], token[4], token[5], token[6], token[7], token[8], token[9])
            )
        
        collection_provider.create_by_campaign(str(owner), "players", str(campaign._id), MapUtils.create_player(map1["_id"], owner))

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
        return json.loads(json_data.strip())

    @staticmethod
    def create_player(map_id, user_id):
        return json.loads(f"""{{
            "mapId": "{map_id}",
            "userId": "{user_id}"
        }}""".strip())
    
class CharacterUtil:
    @staticmethod
    def create_collection_character(image, name, description, border_mode, border_color, token_size=2, icon=None):
        return json.loads(f"""{{
            "_character_version": 1,
            "image": "/static/assets/{image}.png",
            "name": "{name}",
            "description": "{description}",
            "borderMode": "{border_mode}",
            "borderColor": "{border_color}",
            "tokenSize": {token_size}
        }}""".strip())

    @staticmethod
    def create_collection_token(image, name, description, border_mode, border_color, character_id, map_id, x, y, background_color, token_size=2):
        return json.loads(f"""{{
            "_character_version": 1,
            "_token_version": 1,
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
            "character": "{character_id}"
        }}""".strip())