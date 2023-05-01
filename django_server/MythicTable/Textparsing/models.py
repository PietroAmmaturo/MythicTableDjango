
import json

from django.db import models

class Chat(models.Model):
    def __init__(self):
        self.message: str = ""
        self.description: str = ""
        self.elements: list[Element] = []
        self.dice: list[Dice] = []

class Dice(models.Model):
    def __init__(self):
        self.result: float = 0
        self.formula: str = ""
        self.rolls: list[Die] = []

    def __init__(self, element):
        self.result = element['results'].Value
        self.formula = element['results'].Expression
        self.rolls = [Die(dr.NumSides, dr.Value) for dr in element['results'].Values if dr.NumSides > 0]

class Die(models.Model):
    def __init__(self, die: int, value: float):
        self.die = die
        self.value = value

class Element(models.Model):
    def __init__(self):
        self.error: str = ""
        self.text: str = ""
        self.results: Dice = None

    def __init__(self, result):
        self.error = result.get("Error", "")
        self.text = result.get("Text", "")
        if result.get("Results") is not None:
            self.Results = Dice(result)

