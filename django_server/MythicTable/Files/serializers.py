from rest_framework import serializers
from .models import File
from MythicTable.serializers import ObjectIdAPIField, ObjectIdDBField

class FileAPISerializer(serializers.ModelSerializer):
    _id = ObjectIdDBField(source='id')
    reference = serializers.CharField()
    path = serializers.CharField()
    name = serializers.CharField()
    user = serializers.CharField()
    url = serializers.CharField()
    md5 = serializers.CharField()

    # specify model and fields
    class Meta:
        model = File
        fields = ('_id', 'reference', 'path', 'name', 'user', 'url', 'md5')

    def create(self, validated_data):
        if isinstance(validated_data, list):
            # If validated_data is a list, create an instance for each dictionary
            return [self.create_instance(instance_data) for instance_data in validated_data]
        else:
            # If validated_data is not a list, create a single instance
            return self.create_instance(validated_data)

    def create_instance(self, instance_data):
        file = File(**instance_data)
        return file
    
class FileDBSerializer(serializers.ModelSerializer):
    _id = ObjectIdDBField()
    reference = serializers.CharField()
    path = serializers.CharField()
    name = serializers.CharField()
    user = serializers.CharField()
    url = serializers.CharField()
    md5 = serializers.CharField()

    # specify model and fields
    class Meta:
        model = File
        fields = ('_id', 'reference', 'path', 'name', 'user', 'url', 'md5')
        
    def create(self, validated_data):
        if isinstance(validated_data, list):
            # If validated_data is a list, create an instance for each dictionary
            return [self.create_instance(instance_data) for instance_data in validated_data]
        else:
            # If validated_data is not a list, create a single instance
            return self.create_instance(validated_data)

    def create_instance(self, instance_data):
        file = File(**instance_data)
        return file