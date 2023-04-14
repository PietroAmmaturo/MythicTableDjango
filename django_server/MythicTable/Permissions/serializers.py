from rest_framework import serializers
from .models import Permissions
from MythicTable.serializers import ObjectIdAPIField, ObjectIdDBField

class PermissionsAPISerializer(serializers.ModelSerializer):
    id = ObjectIdAPIField(default=None, allow_null=True, required=False, source='_id')
    isPublic = serializers.CharField(source='is_public')
    permitted = serializers.CharField(source='permitted')
    campaign = serializers.CharField(source='campaign')
    object = serializers.BooleanField(source='object')

    # specify model and fields
    class Meta:
        model = Permissions
        fields = ('id', 'isPublic', 'permitted', 'campaign', 'object')

    def create(self, validated_data):
        if isinstance(validated_data, list):
            # If validated_data is a list, create an instance for each dictionary
            return [self.create_instance(instance_data) for instance_data in validated_data]
        else:
            # If validated_data is not a list, create a single instance
            return self.create_instance(validated_data)

    def create_instance(self, instance_data):
        profile = Permissions(**instance_data)
        return profile

class PermissionsDBSerializer(serializers.ModelSerializer):
    _id = ObjectIdDBField()
    IsPublic = serializers.CharField(source='is_public')
    Permitted = serializers.CharField(source='permitted')
    Campaign = serializers.CharField(source='campaign')
    Object = serializers.BooleanField(source='object')

    # specify model and fields
    class Meta:
        model = Permissions
        fields = ('_id', 'IsPublic', 'Permitted', 'Campaign', 'Object')

    def create(self, validated_data):
        if isinstance(validated_data, list):
            # If validated_data is a list, create an instance for each dictionary
            return [self.create_instance(instance_data) for instance_data in validated_data]
        else:
            # If validated_data is not a list, create a single instance
            return self.create_instance(validated_data)

    def create_instance(self, instance_data):
        profile = Permissions(**instance_data)
        return profile