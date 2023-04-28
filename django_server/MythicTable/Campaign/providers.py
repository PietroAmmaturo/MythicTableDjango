from .exceptions import CampaignInvalidException, CampaignNotFoundException, CampaignAddPlayerException, CampaignRemovePlayerException
from .models import Campaign, Player, Message
from .serializers import CampaignDBSerializer, PlayerDBSerializer, MessageDBSerializer, MessageContainerDBSerializer
import pymongo
from bson import ObjectId
from MythicTable.providers import MongoDbProvider

class MongoDbCampaignProvider(MongoDbProvider):
    def __init__(self, client=None, db_name=None):
        super().__init__(client, db_name)
        self.campaign_collection = self.db['campaign']
        self.campaign_messages_collection = self.db['campaign-messages']

    # get using the profile
    def get_all(self, profile_id: str):
        # Define the filter
        filter = {"$or": [{"Owner": profile_id}, {"Players.Name": profile_id}]}
        # Find the first document that matches the filter
        dtos = [doc for doc in self.campaign_collection.find(filter)]
        # Deserialization
        serializer = CampaignDBSerializer(data=dtos, many=True)
        if not serializer.is_valid():
            message = f"The campaigns associated with profile: {profile_id} stored in the DB are not valid: {serializer.errors}"
            raise CampaignInvalidException(message)
        campaign = serializer.create(serializer.validated_data)
        return campaign

    # get using the mongoDB Object id
    def get(self, campaign_id: str):
        # Define the filter
        filter = {"_id": ObjectId(campaign_id)}
        # Find the first document that matches the filter
        dto = self.campaign_collection.find_one(filter)
        if dto is None:
            message = f"Cannot find campaign: {campaign_id}"
            raise CampaignNotFoundException(message)
        # Deserialization
        serializer = CampaignDBSerializer(data=dto)
        if serializer.is_valid():
            campaign = serializer.create(serializer.validated_data)
            return campaign

    def create(self, campaign):
        # Serialization
        serializer = CampaignDBSerializer(campaign)
        new_campaign = serializer.data
        del new_campaign['_id']
        result = self.campaign_collection.insert_one(new_campaign)
        if (not result.acknowledged):
            message = f"Unable to create campaign, result {result}"
            raise CampaignInvalidException(message)
        campaign._id = result.inserted_id

        messages_data = []
        message_serializer = MessageDBSerializer(data=messages_data, many=True)
        if not message_serializer.is_valid():
            message = f"Unable to create campaign messages, serialization errors: {message_container_serializer.errors}"
            raise CampaignInvalidException(message)
        
        message_container_data = {"_id": campaign._id, "Messages": message_serializer.data}
        message_container_serializer = MessageContainerDBSerializer(data=message_container_data)
        if not message_container_serializer.is_valid():
            message = f"Unable to create campaign message container, serialization errors: {message_container_serializer.errors}"
            raise CampaignInvalidException(message)

        result = self.campaign_messages_collection.insert_one(message_container_serializer.data)
        if (not result.acknowledged):
            message = f"Unable to create campaign messages, result: {result}"
            raise CampaignInvalidException(message)
        return campaign

    def get_by_join_id(self, join_id: str):
        filter = {"JoinId": join_id}
        # Find the first document that matches the filter
        dto = self.campaign_collection.find_one(filter)
        if dto is None:
            message = f"Cannot find campaign: {join_id}"
            raise CampaignNotFoundException(message)
        # Deserialization
        serializer = CampaignDBSerializer(data=dto)
        if serializer.is_valid():
            campaign = serializer.create(serializer.validated_data)
            return campaign

    def update(self, campaign_id: str, campaign: Campaign) -> Campaign:
        if campaign is None:
            raise CampaignInvalidException("The campaign is null")
        if campaign_id is None or len(campaign_id) == 0:
            raise CampaignInvalidException("The Campaign MUST have an id")
        campaign._id = ObjectId(campaign_id)
        serializer = CampaignDBSerializer(campaign)
        result = self.campaign_collection.replace_one(
            {"_id": campaign._id}, serializer.data)
        if (not result.acknowledged):
            message = f"Unable to update campaign, result {result}"
            raise CampaignInvalidException(message)
        return campaign

    def delete(self, campaign_id: str) -> Campaign:
        result = self.campaign_collection.delete_one({"_id": ObjectId(campaign_id)})
        if (not result.acknowledged):
            message = f"Unable to delete campaign, result {result}"
            raise CampaignInvalidException(message)

    def get_players(self, campaign_id: str):
        try:
            campaign = self.get(campaign_id)
            return campaign.players
        except CampaignNotFoundException:
            raise CampaignNotFoundException(
                f"Get Players. Cannot find campaign with join id {campaign_id}")

    def add_player(self, campaign_id: str, player: Player) -> Campaign:
        campaign = self.get(campaign_id)
        # Check if player is already in
        if any(p.name == player.name for p in campaign.players):
            raise CampaignAddPlayerException(
                f"The player '{player.name}' is already in campaign {campaign_id}")
        # Add player to the array and let MongoDB generate an _id for the player
        serializer = PlayerDBSerializer(player)
        new_player = serializer.data
        del new_player['_id']
        result = self.campaign_collection.update_one({"_id": ObjectId(campaign_id)}, {
            "$push": {"Players": new_player}})
        # if nothing has been modified
        if result.modified_count == 0:
            raise CampaignAddPlayerException(
                f"Failed to add player '{player.name}' to campaign {campaign_id}, result: {result}")
        campaign = self.get(campaign_id)
        return campaign

    def remove_player(self, campaign_id: str, player: Player) -> Campaign:
        try:
            campaign = self.get(campaign_id)
            number_removed = len(
                [p for p in campaign.players if p.name == player.name])
            if number_removed == 0:
                raise CampaignRemovePlayerException(
                    f"The player '{player.name}' is not in campaign {campaign_id}")
            campaign.players = [
                p for p in campaign.players if p.name != player.name]
            return self.update(campaign_id, campaign)
        except CampaignNotFoundException:
            raise CampaignNotFoundException(
                f"Remove Player. Cannot find campaign of id {campaign_id}")

    def get_messages(self, campaign_id: str, page_size: int, page: int):
        # Define the filter
        filter = {"_id": ObjectId(campaign_id)}
        # Find the first document that matches the filter
        dto = self.campaign_messages_collection.find_one(filter)
        if dto is None:
            message = f"Cannot find campaign messages: {campaign_id}"
            raise CampaignNotFoundException(message)
        # Deserialization
        serializer = MessageContainerDBSerializer(data=dto)
        if not serializer.is_valid():
            message = f"The campaign message container for campaign: {campaign_id} stored in the DB is not valid: {serializer.errors}"
            raise CampaignInvalidException(message)
        campaign_message_container = serializer.create(serializer.validated_data)
        messages = campaign_message_container.messages
        initial_index = len(messages) - (page_size * page)
        # If there are no messages in a page, return empty list
        if initial_index <= -page_size:
            return []
        elif initial_index < 0:
            initial_index = 0
            page_size = messages.len() % page_size
        messages = messages[initial_index: initial_index + page_size]
        return messages


    def add_message(self, campaign_id: str, message: Message):
        # Add player to the array and let MongoDB generate an _id for the player
        serializer = MessageDBSerializer(message)
        new_message = serializer.data
        del new_message['_id']
        result = self.campaign_messages_collection.update_one({"_id": ObjectId(campaign_id)}, {
            "$push": {"Messages": new_message}})
        # if nothing has been modified
        if result.modified_count == 0:
            raise CampaignAddPlayerException(
                f"Failed to add message '{message.name}' to campaign {campaign_id}, result: {result}")
        return message
