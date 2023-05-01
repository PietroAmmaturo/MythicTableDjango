import json
from .models import Chat, Dice, Element
from rest_framework import serializers


class DiceDBSerializer(serializers.ModelSerializer):
    Die = serializers.IntegerField(source="die")
    Value = serializers.FloatField(source="value")

    def to_representation(self, instance):
        return {
            "Die": instance.die,
            "Value": instance.value,
        }

    def to_internal_value(self, data):
        return Dice(**data)


class ElementDBSerializer(serializers.ModelSerializer):
    Text = serializers.CharField(source="text")
    Results = DiceDBSerializer(required=False, source="results")
    Error = serializers.CharField(required=False, source="error")

    def to_representation(self, instance):
        return {
            "Text": instance.text,
            "Results": DiceDBSerializer(instance.results).data if instance.results else None,
            "Error": instance.error,
        }

    def to_internal_value(self, data):
        results_data = data.get("Results")
        results = Dice(**results_data) if results_data else None
        return Element(text=data["Text"], results=results, error=data.get("Error"))


class ChatDBSerializer(serializers.ModelSerializer):
    Dice = DiceDBSerializer(many=True, source="dice")
    Elements = ElementDBSerializer(many=True, source="elements")
    Message = serializers.CharField(source="message")
    Description = serializers.CharField(source="description")

    class Meta:
        model = Chat
        fields = ("Message", "Description", "Elements", "Dice")

    def to_representation(self, instance):
        return {
            "Message": instance.message,
            "Description": instance.description,
            "Elements": instance.elements,
            "Dice": instance.dice,
        }

    def to_internal_value(self, data):
        elements_data = data.pop("Elements")
        dice_data = data.pop("Dice")
        elements = [Element(**d) for d in elements_data]
        dice = [Dice(**d) for d in dice_data]
        return Chat(elements=elements, dice=dice, **data)