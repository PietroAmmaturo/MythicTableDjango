import json
from .models import Chat, Die, Element, RollResult, Dice
from rest_framework import serializers




class DieDBSerializer(serializers.ModelSerializer):
    Die = serializers.IntegerField(source="die")
    Value = serializers.FloatField(source="value")

    class Meta:
        model = Die
        fields = ("Die", "Value")

class DiceDBSerializer(serializers.ModelSerializer):
    Result = serializers.IntegerField(source="result")
    Formula = serializers.CharField(source="formula")
    Rolls = DieDBSerializer(many=True, source="rolls")

    class Meta:
        model = Dice
        fields = ("Result", "Formula", "Rolls")

class RollResultDBSerializer(serializers.ModelSerializer):
    Value = serializers.IntegerField(source="value")
    Expression = serializers.CharField(source="expression")
    Values = DieDBSerializer(many=True, source="values")

    class Meta:
        model = RollResult
        fields = ("Value","Expression","Values")

class ElementDBSerializer(serializers.ModelSerializer):
    Text = serializers.CharField(allow_blank=True, source="text")
    Results = RollResultDBSerializer(source="results", required=False)
    Error = serializers.CharField(allow_blank=True, source="error", required=False)
    Index = serializers.IntegerField(source = "index", required=False)

    class Meta:
        model = Element
        fields = ("Text", "Results", "Error", "Index")

#In case of a normal message everything will be none
class ChatDBSerializer(serializers.ModelSerializer):
    Dice = DiceDBSerializer(many=True, source="dice", required=False)
    Elements = ElementDBSerializer(many=True, source="elements")
    Message = serializers.CharField(source="message")
    Description = serializers.CharField(allow_blank=True,source="description", required=False)

    class Meta:
        model = Chat
        fields = ("Message", "Description", "Elements", "Dice")

class DieAPISerializer(serializers.ModelSerializer):
    die = serializers.IntegerField()
    value = serializers.FloatField()

    class Meta:
        model = Die
        fields = ("die", "value")

class DiceAPISerializer(serializers.ModelSerializer):
    result = serializers.IntegerField()
    formula = serializers.CharField()
    rolls = DieAPISerializer(many=True)

    class Meta:
        model = Dice
        fields = ("result", "formula", "rolls")

class RollResultAPISerializer(serializers.ModelSerializer):
    result = serializers.IntegerField(source="value")
    formula = serializers.CharField(source="expression")
    rolls = DieAPISerializer(many=True, source="values")

    class Meta:
        model = RollResult
        fields = ("result","formula","rolls")

class ElementAPISerializer(serializers.ModelSerializer):
    text = serializers.CharField(default="", allow_blank=True, required=False)
    results = RollResultAPISerializer(required=False)
    error = serializers.CharField(allow_blank=True, required=False)
    index = serializers.IntegerField(required=False)

    class Meta:
        model = Element
        fields = ("text", "results", "error", "index")

#In case of a normal message everything will be none
class ChatAPISerializer(serializers.ModelSerializer):
    dice = DiceAPISerializer(many=True, required=False)
    elements = ElementAPISerializer(many=True)
    message = serializers.CharField()
    description = serializers.CharField(default="", allow_blank=True)

    class Meta:
        model = Chat
        fields = ("message", "description", "elements", "dice")