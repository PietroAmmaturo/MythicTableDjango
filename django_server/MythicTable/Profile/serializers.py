from django.contrib.auth.models import User, Group
from rest_framework import serializers
from .models import Profile
from bson import ObjectId, json_util

class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ['url', 'username', 'email', 'groups']


class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ['url', 'name']
        
class ObjectIdAPIField(serializers.Field):
    def to_representation(self, value):
        return str(value)

    def to_internal_value(self, data):
        try:
            return ObjectId(data)
        except:
            raise serializers.ValidationError("Invalid ObjectId")
        
class ProfileAPISerializer(serializers.ModelSerializer):
    id = ObjectIdAPIField(source='_id')
    userId = serializers.CharField(source='user_id')
    displayName = serializers.CharField(source='display_name')
    imageUrl = serializers.CharField(source='image_url')
    hasSeenFPSplash = serializers.BooleanField(source='has_seen_FP_splash')
    hasSeenKSSplash = serializers.BooleanField(source='has_seen_KS_splash')
    groups = serializers.CharField()

    # specify model and fields
    class Meta:
        model = Profile
        fields = ('id', 'userId', 'displayName', 'imageUrl', 'hasSeenFPSplash', 'hasSeenKSSplash', 'groups')

    def create(self):
        instance_data = self.validated_data
        profile = Profile(**instance_data)
        return profile

class ObjectIdDBField(serializers.Field):
    def to_representation(self, value):
        try:
            return ObjectId(value)
        except:
            raise serializers.ValidationError(f"Invalid ObjectId: {value} (to_representation)")

    def to_internal_value(self, data):
        try:
            return ObjectId(data)
        except:
            raise serializers.ValidationError(f"Invalid ObjectId: {data} (to_internal_value)")
        
class ProfileDBSerializer(serializers.ModelSerializer):
    _id = ObjectIdDBField()
    UserId = serializers.CharField(source='user_id')
    DisplayName = serializers.CharField(source='display_name')
    ImageUrl = serializers.CharField(source='image_url')
    HasSeenFPSplash = serializers.BooleanField(source='has_seen_FP_splash')
    HasSeenKSSplash = serializers.BooleanField(source='has_seen_KS_splash')
    Groups = serializers.ListField(child=serializers.CharField(), source='groups')

    # specify model and fields
    class Meta:
        model = Profile
        fields = ('_id', 'UserId', 'DisplayName', 'ImageUrl', 'HasSeenFPSplash', 'HasSeenKSSplash', 'Groups')

    def create(self):
        instance_data = self.validated_data
        profile = Profile(**instance_data)
        return profile