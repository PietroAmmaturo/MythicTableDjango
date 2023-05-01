from channels.consumer import SyncConsumer
import json

from channels.generic.websocket import AsyncWebsocketConsumer
import json
from asgiref.sync import sync_to_async

from Campaign.providers import MongoDbCampaignProvider
from Campaign.serializers import MessageAPISerializer
from Collections.providers import MongoDbCollectionProvider
from Permissions.providers import MongoDbPermissionProvider
from Permissions.exceptions import UnauthorizedException
from Profile.providers import MongoDbProfileProvider
from .authentication import AuthenticationBackend

class LivePlayConsumer(AsyncWebsocketConsumer):
    client = None
    db_name = None
    campaign_provider = None
    collection_provider = None
    permission_provider = None
    profile_provider = None
    def __init__(self, profile_provider=None, permission_provider=None, campaign_provider=None, collection_provider=None, client=None, db_name=None):
        super().__init__()
        self.client = client
        self.db_name = db_name
        self.campaign_provider = campaign_provider or MongoDbCampaignProvider(self.client, self.db_name)
        self.collection_provider = collection_provider or MongoDbCollectionProvider(self.client, self.db_name)
        self.permission_provider = permission_provider or MongoDbPermissionProvider(self.client, self.db_name)
        self.profile_provider = profile_provider or MongoDbProfileProvider(self.client, self.db_name)
        self.authentication = AuthenticationBackend()

    async def validate_campaign_member(self, campaign_id):
        campaign = self.campaign_provider.get(campaign_id)
        profile_id = str(self.profile_provider.get_by_user_id(self.scope["session"]["userinfo"]["sub"])._id)
        print(f"---Validating Campaign Member {profile_id} {campaign_id}")
        if campaign.owner != profile_id and not any(player.name == profile_id for player in campaign.players):
            error_message = f"User: {profile_id} is not in Campaign: {campaign_id}"
            print(f"UnauthorizedException with User: {profile_id} in Campaign: {campaign_id}")
            raise UnauthorizedException(error_message)
        
    async def connect(self):
        user = await sync_to_async(self.authentication.authenticate, thread_sensitive=True)(scope=self.scope)
        if user is not None:
            await self.accept()
            await self.send(text_data=json.dumps({
                'type': 'websocket_accept',
                'message': 'Connection accepted'
            }))
        else:
            await self.close()


    async def receive(self, text_data):
        # convert received data to a dictionary
        data = json.loads(text_data)

        # create a dictionary to map message types to functions
        message_types = {
            'join_session': self.handle_join_session,
            'add_character': self.handle_add_character,
            'remove_character': self.handle_remove_character,
            'roll_dice': self.handle_roll_dice,
            'update_object': self.handle_update_object,
            'add_collection_item': self.handle_add_collection_item,
            'remove_campaign_object': self.handle_remove_campaign_object,
            'draw_line': self.handle_draw_line,
        }

        # check if the message type exists in the dictionary and call the appropriate function
        if(data):
            message_type = data.get('type')
            if message_type and message_type in message_types:
                await message_types[message_type](data)
            else:
                await self.handle_unknown_type(data)

    async def handle_join_session(self, data):
        print('handle_join_session', data)
        group_name = data['request']['campaignId']
        await self.channel_layer.group_add(group_name, self.channel_name)

    async def handle_add_character(self, data):
        print('handle_add_character', data)

    async def handle_remove_character(self, data):
        print('handle_remove_character', data)

    async def handle_roll_dice(self, data):
        print('handle_roll_dice', data)
        group_name = data['request']['diceObject']['sessionId']
        await self.validate_campaign_member(data['request']['diceObject']['sessionId'])

        serializer = MessageAPISerializer(data = data['request']['diceObject'])
        if serializer.is_valid():
            message = serializer.create_instance(serializer.data)
            print(f"Dice Roll - User: {message.user_id} Roll: {message.message} Results: {message.result.dice} Message: {message.result.message}")
            campaign_id = message.session_id
            print("---Sending Message", message)
            await self.campaign_provider.add_message(campaign_id, message)
            # Send the message to the group
            await self.channel_layer.group_send(
                group_name,
                {
                    "type": "message_received",
                    "message": message
                }
            )
            return True
        else:
            print(serializer.errors)

    async def handle_update_object(self, data):
        print('handle_update_object', data)

    async def handle_add_collection_item(self, data):
        print('handle_add_collection_item', data)

    async def handle_remove_campaign_object(self, data):
        print('handle_remove_campaign_object', data)

    async def handle_draw_line(self, data):
        print('handle_draw_line', data)

    async def handle_unknown_type(self, data):
        print('handle_unknown_type', data)