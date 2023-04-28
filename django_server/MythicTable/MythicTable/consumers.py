from channels.consumer import SyncConsumer
import json

class LivePlayConsumer(SyncConsumer):
    def websocket_connect(self, event):
        self.send({
            "type": "websocket.accept",
        })

    def websocket_disconnect(self, close_code):
        print("WebSocket connection closed.")

    def websocket_receive(self, text_data):
        message = json.loads(text_data)
        type = message.get('type')

        if type == 'join_session':
            session_id = message.get('sessionId')
            # Handle join session logic here
        elif type == 'add_character':
            request = message.get('request')
            # Handle add character logic here
        elif type == 'remove_character':
            request = message.get('request')
            # Handle remove character logic here
        elif type == 'roll_dice':
            request = message.get('request')
            # Handle roll dice logic here
        elif type == 'update_object':
            payload = message.get('payload')
            # Handle update object logic here
        elif type == 'add_collection_item':
            payload = message.get('payload')
            # Handle add collection item logic here
        elif type == 'remove_campaign_object':
            payload = message.get('payload')
            # Handle remove campaign object logic here
        else:
            print(f"Unknown message type: {type}")