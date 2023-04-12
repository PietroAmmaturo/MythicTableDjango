from bson import ObjectId
from rest_framework import serializers
from datetime import datetime

class ObjectIdAPIField(serializers.Field):
    def to_representation(self, value):
        return str(value)

    def to_internal_value(self, data):
        try:
            return ObjectId(data)
        except:
            raise serializers.ValidationError("Invalid ObjectId")

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

class DateTimeDBField(serializers.Field):
    def to_representation(self, value):
        if not isinstance(value, datetime):
            raise serializers.ValidationError(
                'Value must be a datetime object')
        return value

    def to_internal_value(self, data):
        if not isinstance(data, datetime):
            raise serializers.ValidationError(
                'Value must be a datetime object')
        return data


class IdenticalField(serializers.Field):
    def to_representation(self, value):
        return value

    def to_internal_value(self, data):
        return data