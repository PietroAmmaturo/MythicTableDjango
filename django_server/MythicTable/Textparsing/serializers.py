import json
from .models import Chat, Dice, Element
from rest_framework import serializers


class DiceDBSerializer(serializers.ModelSerializer):
    Die = serializers.IntegerField(source="die")
    Value = serializers.FloatField(source="value")

    class Meta:
        model = Dice
        fields = ("Die", "Value")

    def to_internal_value(self, data):
        return Dice(**data)


class ElementDBSerializer(serializers.ModelSerializer):
    Text = serializers.CharField(allow_blank=True, source="text")
    Results = DiceDBSerializer(allow_null=True, source="results")
    Error = serializers.CharField(allow_blank=True, source="error")

    class Meta:
        model = Element
        fields = ("Text", "Results", "Error")

#In case of a normal message everything will be none
class ChatDBSerializer(serializers.ModelSerializer):
    Dice = DiceDBSerializer(many=True, source="dice", required=False)
    Elements = ElementDBSerializer(many=True, source="elements")
    Message = serializers.CharField(source="message")
    Description = serializers.CharField(allow_blank=True,source="description", required=False)

    class Meta:
        model = Chat
        fields = ("Message", "Description", "Elements", "Dice")


class DiceAPISerializer(serializers.ModelSerializer):
    die = serializers.IntegerField(source="die")
    value = serializers.FloatField(source="value")

    class Meta:
        model = Dice
        fields = ("die", "value")


class ElementAPISerializer(serializers.ModelSerializer):
    text = serializers.CharField(default="", allow_blank=True, required=False)
    results = DiceAPISerializer(default=None, allow_null=True, required=False)
    error = serializers.CharField(default="", allow_blank=True, required=False)

    class Meta:
        model = Element
        fields = ("text", "results", "error")

#In case of a normal message everything will be none
class ChatAPISerializer(serializers.ModelSerializer):
    dice = DiceAPISerializer(many=True, required=False)
    elements = ElementAPISerializer(many=True)
    message = serializers.CharField()
    description = serializers.CharField(default="", allow_blank=True)

    class Meta:
        model = Chat
        fields = ("message", "description", "elements", "dice")