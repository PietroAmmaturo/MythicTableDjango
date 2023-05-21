from rest_framework import serializers
from .models import Permission
from MythicTable.serializers import ObjectIdAPIField, ObjectIdDBField

class PermissionAPISerializer(serializers.ModelSerializer):
    id = ObjectIdAPIField(default=None, allow_null=True, required=False, source='_id')
    isPublic = serializers.CharField(source='is_public')
    permitted = serializers.CharField(source='permitted')
    campaign = serializers.CharField(source='campaign')
    object = serializers.BooleanField(source='object')

    class Meta:
        model = Permission
        fields = ('id', 'isPublic', 'permitted', 'campaign', 'object')

    def create(self, validated_data):
        if isinstance(validated_data, list):
            return [self.create_instance(instance_data) for instance_data in validated_data]
        else:
            return self.create_instance(validated_data)

    def create_instance(self, instance_data):
        profile = Permission(**instance_data)
        return profile

class PermissionDBSerializer(serializers.ModelSerializer):
    _id = ObjectIdDBField()
    IsPublic = serializers.CharField(source='is_public')
    Permitted = serializers.CharField(source='permitted')
    Campaign = serializers.CharField(source='campaign')
    Object = serializers.BooleanField(source='object')

    class Meta:
        model = Permission
        fields = ('_id', 'IsPublic', 'Permitted', 'Campaign', 'Object')

    def create(self, validated_data):
        if isinstance(validated_data, list):
            return [self.create_instance(instance_data) for instance_data in validated_data]
        else:
            return self.create_instance(validated_data)

    def create_instance(self, instance_data):
        profile = Permission(**instance_data)
        return profile