from rest_framework import serializers
from .models import Profile
from MythicTable.serializers import ObjectIdAPIField, ObjectIdDBField

class ProfileAPISerializer(serializers.ModelSerializer):
    id = ObjectIdAPIField(default=None, allow_null=True, required=False, source='_id')
    userId = serializers.CharField(source='user_id')
    displayName = serializers.CharField(source='display_name')
    imageUrl = serializers.CharField(source='image_url')
    hasSeenFPSplash = serializers.BooleanField(source='has_seen_FP_splash')
    hasSeenKSSplash = serializers.BooleanField(source='has_seen_KS_splash')
    groups = serializers.ListField(child=serializers.CharField())

    # specify model and fields
    class Meta:
        model = Profile
        fields = ('id', 'userId', 'displayName', 'imageUrl', 'hasSeenFPSplash', 'hasSeenKSSplash', 'groups')

    def create(self, validated_data):
        if isinstance(validated_data, list):
            # If validated_data is a list, create an instance for each dictionary
            return [self.create_instance(instance_data) for instance_data in validated_data]
        else:
            # If validated_data is not a list, create a single instance
            return self.create_instance(validated_data)

    def create_instance(self, instance_data):
        profile = Profile(**instance_data)
        return profile

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

    def create(self, validated_data):
        if isinstance(validated_data, list):
            # If validated_data is a list, create an instance for each dictionary
            return [self.create_instance(instance_data) for instance_data in validated_data]
        else:
            # If validated_data is not a list, create a single instance
            return self.create_instance(validated_data)

    def create_instance(self, instance_data):
        profile = Profile(**instance_data)
        return profile