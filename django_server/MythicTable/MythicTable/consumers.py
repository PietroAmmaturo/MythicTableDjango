from channels.consumer import SyncConsumer
import json

from channels.generic.websocket import AsyncWebsocketConsumer
import json

class LivePlayConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        await self.send(text_data=json.dumps({
            'type': 'websocket_accept',
            'message': 'Connection accepted'
        }))

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

    async def handle_add_character(self, data):
        print('handle_add_character', data)

    async def handle_remove_character(self, data):
        print('handle_remove_character', data)

    async def handle_roll_dice(self, data):
        print('handle_roll_dice', data)

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