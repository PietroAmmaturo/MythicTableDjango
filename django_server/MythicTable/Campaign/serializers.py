from rest_framework import serializers
from .models import Campaign, Player, Message, MessageContainer
from django.utils import timezone
from MythicTable.serializers import ObjectIdAPIField, ObjectIdDBField, DateTimeDBField

########################
#API
########################
class PlayerAPISerializer(serializers.ModelSerializer):
    id = ObjectIdAPIField(default=None, allow_null=True,
                          required=False, source='_id')
    name = serializers.CharField(
        default=None, allow_blank=True, allow_null=True, required=False, source='name')

    class Meta:
        model = Player
        fields = ('id', 'name')


class CampaignAPISerializer(serializers.ModelSerializer):
    id = ObjectIdAPIField(default=None, allow_null=True,
                          required=False, source='_id')
    joinId = serializers.CharField(
        default=None, allow_blank=True, allow_null=True, required=False, source='join_id')
    owner = serializers.CharField(
        allow_blank=True, allow_null=True, required=False)
    name = serializers.CharField()
    description = serializers.CharField()
    imageUrl = serializers.CharField(source='image_url')
    created = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", input_formats=[
                                        '%m/%d/%Y %H:%M:%Sv %Z', '%m/%d/%Y %H:%M:%Sv', '%m/%d/%Y %H:%M', '%m/%d/%Y %H:%M:%S', '%m/%d/%Y', '%Y-%m-%d %H:%M:%S'])
    lastModified = serializers.DateTimeField(
        required=False, source='last_modified')
    players = PlayerAPISerializer(required=False, many=True)
    tutorialCampaign = serializers.BooleanField(
        default=False, source='tutorial_campaign')

    # specify model and fields
    class Meta:
        model = Campaign
        fields = ('id', 'joinId', 'owner', 'name', 'description', 'imageUrl',
                  'created', 'lastModified', 'players', 'tutorialCampaign')

    def create(self, validated_data):
        if isinstance(validated_data, list):
            # If validated_data is a list, create an instance for each dictionary
            return [self.create_instance(instance_data) for instance_data in validated_data]
        else:
            # If validated_data is not a list, create a single instance
            return self.create_instance(validated_data)

    def create_instance(self, instance_data):
        if 'last_modified' not in instance_data or not instance_data['last_modified']:
            instance_data['last_modified'] = instance_data['created']
        campaign = Campaign(**instance_data)
        return campaign

class MessageAPISerializer(serializers.ModelSerializer):
    id = ObjectIdAPIField(default=None, allow_null=True,
                          required=False, source='_id')
    sender = serializers.CharField(
        allow_blank=True, allow_null=True, required=False)
    receiver = serializers.CharField(
        allow_blank=True, allow_null=True, required=False)
    content = serializers.CharField()
    timestamp = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", input_formats=[
                                          '%m/%d/%Y %H:%M:%Sv %Z', '%m/%d/%Y %H:%M:%Sv', '%m/%d/%Y %H:%M', '%m/%d/%Y %H:%M:%S', '%m/%d/%Y', '%Y-%m-%d %H:%M:%S'])

    class Meta:
        model = Message
        fields = ('id', 'sender', 'receiver', 'content', 'timestamp')

    def create(self, validated_data):
        if isinstance(validated_data, list):
            # If validated_data is a list, create an instance for each dictionary
            return [self.create_instance(instance_data) for instance_data in validated_data]
        else:
            # If validated_data is not a list, create a single instance
            return self.create_instance(validated_data)

    def create_instance(self, instance_data):
        if 'timestamp' not in instance_data or not instance_data['timestamp']:
            instance_data['timestamp'] = timezone.now()
        message = Message(**instance_data)
        return message
########################
#DB
########################
class PlayerDBSerializer(serializers.ModelSerializer):
    _id = ObjectIdDBField(source='_id')
    Name = serializers.CharField(source='name')

    class Meta:
        model = Player
        fields = ('Id', 'Name')

class CampaignDBSerializer(serializers.ModelSerializer):
    _id = ObjectIdDBField()
    JoinId = serializers.CharField(
        allow_blank=True, allow_null=True, required=False, source='join_id')
    Owner = serializers.CharField(source='owner')
    Name = serializers.CharField(source='name')
    Description = serializers.CharField(source='description')
    ImageUrl = serializers.CharField(source='image_url')
    Created = DateTimeDBField(source='created')
    LastModified = DateTimeDBField(
        default=None, required=False, source='last_modified')
    Players = PlayerDBSerializer(required=False, many=True, source='players')
    TutorialCampaign = serializers.BooleanField(
        default=False, source='tutorial_campaign')

    class Meta:
        model = Campaign
        fields = ('_id', 'JoinId', 'Owner', 'Name', 'Description', 'ImageUrl',
                  'Created', 'LastModified', 'Players', 'TutorialCampaign')

    def create(self, validated_data):
        if isinstance(validated_data, list):
            # If validated_data is a list, create an instance for each dictionary
            return [self.create_instance(instance_data) for instance_data in validated_data]
        else:
            # If validated_data is not a list, create a single instance
            return self.create_instance(validated_data)

    def create_instance(self, instance_data):
        campaign = Campaign(**instance_data)
        return campaign

class MessageDBSerializer(serializers.ModelSerializer):
    _id = ObjectIdDBField()
    Sender = serializers.CharField(source='sender')
    Receiver = serializers.CharField(source='receiver')
    Content = serializers.CharField(source='content')
    Timestamp = DateTimeDBField(source='timestamp')

    class Meta:
        model = Message
        fields = ('_id', 'Sender', 'Receiver', 'Content', 'Timestamp')

    def create(self, validated_data):
        if isinstance(validated_data, list):
            # If validated_data is a list, create an instance for each dictionary
            return [self.create_instance(instance_data) for instance_data in validated_data]
        else:
            # If validated_data is not a list, create a single instance
            return self.create_instance(validated_data)

    def create_instance(self, instance_data):
        message = Message(**instance_data)
        return message


class MessageContainerDBSerializer(serializers.ModelSerializer):
    _id = ObjectIdDBField()
    Messages = MessageDBSerializer(source='messages')

    class Meta:
        model = MessageContainer
        fields = ('_id', 'Messages')

    def create(self, validated_data):
        if isinstance(validated_data, list):
            # If validated_data is a list, create an instance for each dictionary
            return [self.create_instance(instance_data) for instance_data in validated_data]
        else:
            # If validated_data is not a list, create a single instance
            return self.create_instance(validated_data)

    def create_instance(self, instance_data):
        message_container = MessageContainer(**instance_data)
        return message_container