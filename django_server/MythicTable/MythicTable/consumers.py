from channels.consumer import SyncConsumer
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from bson.json_util import loads, dumps
import json
from Campaign.providers import MongoDbCampaignProvider
from Campaign.serializers import MessageAPISerializer
from Collections.providers import MongoDbCollectionProvider
from Permission.providers import MongoDbPermissionProvider
from Permission.exceptions import UnauthorizedException
from Profile.providers import MongoDbProfileProvider
from Permission.models import Permission
from .authentication import AuthenticationBackend
from .exceptions import MythicTableException

class LivePlayConsumer(AsyncWebsocketConsumer):
    client = None
    db_name = None
    campaign_provider = None
    collection_provider = None
    permission_provider = None
    profile_provider = None
    group_name = None
    def __init__(self, profile_provider=None, permission_provider=None, campaign_provider=None, collection_provider=None, client=None, db_name=None):
        super().__init__()
        self.client = client
        self.db_name = db_name
        self.campaign_provider = campaign_provider or MongoDbCampaignProvider(self.client, self.db_name)
        self.collection_provider = collection_provider or MongoDbCollectionProvider(self.client, self.db_name)
        self.permission_provider = permission_provider or MongoDbPermissionProvider(self.client, self.db_name)
        self.profile_provider = profile_provider or MongoDbProfileProvider(self.client, self.db_name)
        self.authentication = AuthenticationBackend()
        self.group_name = None

    async def validate_campaign_member(self, campaign_id):
        """
        Validates if the user is a member of the given campaign.

        Args:
            campaign_id (str): The ID of the campaign.

        Raises:
            UnauthorizedException: If the user is not a member of the campaign.
        """
        campaign = self.campaign_provider.get(campaign_id)
        profile_id = str(self.profile_provider.get_by_user_id(self.scope["session"]["userinfo"]["sub"])._id)
        if campaign.owner != profile_id and not any(player.name == profile_id for player in campaign.players):
            error_message = f"User: {profile_id} is not in Campaign: {campaign_id}"
            raise UnauthorizedException(error_message)
        
    async def connect(self):
        """
        Handles the WebSocket connection establishment.

        If the user is authenticated, accepts the connection and sends an acceptance message.
        Otherwise, closes the connection.
        """
        user = await sync_to_async(self.authentication.authenticate, thread_sensitive=True)(scope=self.scope)
        if user is not None:
            await self.accept()
            await self.send(text_data=json.dumps({
                'type': 'websocket_accept',
                'message': 'Connection accepted'
            }))
        else:
            await self.close()

    async def disconnect(self, close_code):
        """
        Handles the WebSocket disconnection.

        If the user is in a group, discards the group and sets self.group_name to None.
        """
        if self.group_name:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
            self.group_name = None
        if close_code == 1001:
            print("User intentionally disconnected.")
        elif close_code in (1006, 1011):
            print("User disconnected unexpectedly.")
        else:
            print("User disconnected with code:", close_code)
            
    async def receive(self, text_data):
        """
        Handles the reception of messages from the WebSocket connection.

        Args:
            text_data (str): The received message in JSON format.
        """
        # convert received data to a dictionary
        data = json.loads(text_data)

        # create a dictionary to map message types to functions
        message_types = {
            'join_session': self.handle_join_session,
            'roll_dice': self.handle_roll_dice,
            'update_object': self.handle_update_object,
            'add_collection_item': self.handle_add_collection_item,
            'remove_campaign_object': self.handle_remove_campaign_object,
            'draw_line': self.handle_draw_line,
            'message_received': self.message_received
        }

        # check if the message type exists in the dictionary and call the appropriate function
        if(data):
            message_type = data.get('type')
            if message_type and message_type in message_types:
                await message_types[message_type](data)
            else:
                await self.handle_unknown_type(data)

    async def handle_join_session(self, data):
        """
        Handles the 'join_session' message type.

        Joins the specified session group and sends an acceptance message.

        Args:
            data (dict): The message data.
        """
        try:
            group_name = data['request']['campaignId']
            await self.channel_layer.group_add(group_name, self.channel_name)
            self.group_name = group_name
            message = {
                "type": "join_accept",
                "message": "This is a reply from the server."
            }
            await self.send(text_data=json.dumps(message))
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'join_refuse',
                'message': "join refused due to exception"
            }))
            await self.send(text_data=json.dumps({
                'type': 'exception_raised',
                'message': e
            }))
            await self.close()

    async def handle_roll_dice(self, data):
        """
        Handles the 'roll_dice' message type.

        Performs actions related to rolling dice in the specified campaign.

        Args:
            data (dict): The message data.
        """
        try:
            group_name = data['payload']['campaignId']
            message_data = data['payload']['diceObject']
            await self.validate_campaign_member(group_name)

            serializer = MessageAPISerializer(data=message_data)
            if serializer.is_valid():
                message = serializer.create(serializer.validated_data)
                campaign_id = message.session_id
                sent_message = self.campaign_provider.add_message(campaign_id, message)
                serializer = MessageAPISerializer(sent_message)
                # Send the message to the group
                await self.channel_layer.group_send(
                    group_name,
                    {
                        "type": "message_received",
                        "message": serializer.data
                    }
                )
            else:
                raise MythicTableException("Unable to send message due to serializing errors: ", serializer.errors)
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'exception_raised',
                'message': e
            }))

    async def handle_update_object(self, data):
        """
        Handles the 'update_object' message type.

        Updates an object in the specified campaign.

        Args:
            data (dict): The message data.
        """
        try:
            group_name = data['payload']['campaignId']
            profile_id = str(self.profile_provider.get_by_user_id(self.scope["session"]["userinfo"]["sub"])._id)
            campaign_id = data['payload']['campaignId']
            item_id = data['payload']['id']
            collection = data['payload']['collection']
            patch = data['payload']['patch']
            await self.validate_campaign_member(group_name)

            if not self.permission_provider.is_authorized(profile_id, campaign_id, item_id):
                raise UnauthorizedException(f"Update object failed User: {profile_id}, Campaign: {campaign_id}, Object {item_id}")
            self.collection_provider.update_by_campaign(collection, campaign_id, item_id, patch)
            # Send the message to the group
            await self.channel_layer.group_send(
                group_name,
                {
                    "type": "object_updated",
                    "parameters": data['payload'],
                }
            )
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'exception_raised',
                'message': e
            }))
    
    async def handle_add_collection_item(self, data):
        """
        Handles the 'add_collection_item' message type.

        Adds an item to a collection in the specified campaign.

        Args:
            data (dict): The message data.
        """
        try:
            group_name = data['payload']['campaignId']
            profile_id = str(self.profile_provider.get_by_user_id(self.scope["session"]["userinfo"]["sub"])._id)
            campaign_id = data['payload']['campaignId']
            collection = data['payload']['collection']
            item = data['payload']['item']

            await self.validate_campaign_member(group_name)

            new_item = self.collection_provider.create_by_campaign(profile_id, collection, campaign_id, item)
            # Send the message to the group
            await self.channel_layer.group_send(
                group_name,
                {
                    "type": "object_added",
                    "collection": collection,
                    "item": new_item
                }
            )
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'exception_raised',
                'message': e
            }))
    
    async def handle_remove_campaign_object(self, data):
        """
        Handles the 'remove_campaign_object' message type.

        Removes an object from the specified campaign.

        Args:
            data (dict): The message data.
        """
        try:
            group_name = data['payload']['campaignId']
            profile_id = str(self.profile_provider.get_by_user_id(self.scope["session"]["userinfo"]["sub"])._id)
            campaign_id = data['payload']['campaignId']
            item_id = data['payload']['id']
            collection = data['payload']['collection']
            await self.validate_campaign_member(group_name)

            if not self.permission_provider.is_authorized(profile_id, campaign_id, item_id):
                raise UnauthorizedException(f"Remove object failed User: {profile_id}, Campaign: {campaign_id}, Object {item_id}")
            self.collection_provider.delete_by_campaign(collection, campaign_id, item_id)
            # Send the message to the group
            await self.channel_layer.group_send(
                group_name,
                {
                    "type": "object_removed",
                    "collection": collection,
                    "id": item_id
                }
            )
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'exception_raised',
                'message': e
            }))

    async def handle_draw_line(self, data):
        """
        Handles the 'draw_line' message type.

        Draws a line on the canvas in the specified campaign.

        Args:
            data (dict): The message data.
        """
        try:
            group_name = data['payload']['campaignId']
            line = data['payload']['line']
            await self.validate_campaign_member(group_name)
            # Send the message to the group
            await self.channel_layer.group_send(
                group_name,
                {
                    "type": "line_drawn",
                    "line": line
                }
            )
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'exception_raised',
                'message': e
            }))

    async def handle_unknown_type(self, data):
        """
        Handles unknown message types.

        Args:
            data (dict): The message data.
        """
        try:
            raise MythicTableException("Unknown message type")
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'exception_raised',
                'message': e
            }))

    async def message_received(self, data):
        """
        Handles the 'message_received' event.

        Sends the received message to the WebSocket connection.

        Args:
            event (dict): The event data.
        """
        message = {
            "type": "message_received",
            "message": data["message"]
        }
        await self.send(text_data=dumps(message))

    async def object_added(self, data):
        """
        Sends a notification to the client about an object being added to a collection.

        Args:
            data (dict): The data containing information about the added object.
                It should include the following keys:
                - 'collection': The name of the collection.
                - 'item': The added item.
        """
        message = {
                "type": "object_added",
                "collection": data['collection'],
                "item": data['item']
        }
        await self.send(text_data=dumps(message))

    async def object_updated(self, data):
        """
        Handles the 'object_updated' event.

        Sends the updated object data to the WebSocket connection.

        Args:
            event (dict): The event data.
        """
        message = {
                "type": "object_updated",
                "parameters": data['parameters']
        }
        await self.send(text_data=dumps(message))

    async def object_removed(self, data):
        """
        Handles the 'object_removed' event.

        Sends the removed object data to the WebSocket connection.

        Args:
            event (dict): The event data.
        """
        message = {
                "type": "object_removed",
                "collection": data['collection'],
                "id": data['id']
        }
        await self.send(text_data=dumps(message))

    async def line_drawn(self, data):
        """
        Handles the 'line_drawn' event.

        Sends the drawn line data to the WebSocket connection.

        Args:
            event (dict): The event data.
        """
        message = {
                "type": "line_drawn",
                "line": data['line']
        }
        await self.send(text_data=dumps(message))