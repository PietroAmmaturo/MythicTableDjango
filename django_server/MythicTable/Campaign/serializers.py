from rest_framework import serializers
from .models import Campaign, Player
from django.utils import timezone
from MythicTable.serializers import ObjectIdAPIField, ObjectIdDBField
from datetime import datetime

class PlayerAPIField(serializers.Field):
    def to_representation(self, value):
        try:
            return str(value)
        except:
            raise serializers.ValidationError(f"Invalid Player: {value} (to_representation)")

    def to_internal_value(self, data):
        try:
            return Player(_id = data._id, name = data.name)
        except:
            raise serializers.ValidationError(f"Invalid Players: {data} (to_representation)")
        
class CampaignAPISerializer(serializers.ModelSerializer):
    _id = ObjectIdAPIField(default=None, allow_null=True, required=False)
    joinId = serializers.CharField(default=None, allow_blank=True, allow_null=True, required=False, source='join_id')
    owner = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    name = serializers.CharField()
    description = serializers.CharField()
    imageUrl = serializers.CharField(source='image_url')
    created = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", input_formats=['%m/%d/%Y %H:%M:%Sv %Z', '%m/%d/%Y %H:%M:%Sv', '%m/%d/%Y %H:%M', '%m/%d/%Y %H:%M:%S', '%m/%d/%Y'])
    lastModified = serializers.DateTimeField(required=False, source='last_modified')
    players = serializers.ListField(child=PlayerAPIField(), required=False)
    tutorialCampaign = serializers.BooleanField(default=False, source='tutorial_campaign')

    # specify model and fields
    class Meta:
        model = Campaign
        fields = ('_id', 'joinId', 'owner', 'name', 'description', 'imageUrl', 'created', 'lastModified', 'players', 'tutorialCampaign')

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
       
class PlayerDBField(serializers.Field):
    def to_representation(self, value):
        if not isinstance(value, Player):
            raise serializers.ValidationError(f"Invalid Player: {value} (to_representation)")
        return value

    def to_internal_value(self, data):
        if not isinstance(data, Player):
            raise serializers.ValidationError(f"Invalid Player: {data} (to_internal_value)")
        return data


class DateTimeDBField(serializers.Field):
    def to_representation(self, value):
        if not isinstance(value, datetime):
            raise serializers.ValidationError('Value must be a datetime object')
        return value

    def to_internal_value(self, data):
        if not isinstance(data, datetime):
            raise serializers.ValidationError('Value must be a datetime object')
        return data
        
class IdenticalField(serializers.Field):
    def to_representation(self, value):
        return value

    def to_internal_value(self, data):
        return data
    
class CampaignDBSerializer(serializers.ModelSerializer):
    _id = ObjectIdDBField()
    JoinId = serializers.CharField(allow_blank=True, allow_null=True, required=False, source='join_id')
    Owner = serializers.CharField(source='owner')
    Name = serializers.CharField(source='name')
    Description = serializers.CharField(source='description')
    ImageUrl = serializers.CharField(source='image_url')
    Created = DateTimeDBField(source='created')
    LastModified = DateTimeDBField(default=None, required=False,source='last_modified')
    Players = serializers.ListField(child=PlayerDBField(), required=False, source='players')
    TutorialCampaign = serializers.BooleanField(default=False, source='tutorial_campaign')

    class Meta:
        model = Campaign
        fields = ('_id', 'JoinId', 'Owner', 'Name', 'Description', 'ImageUrl', 'Created', 'LastModified', 'Players', 'TutorialCampaign')

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