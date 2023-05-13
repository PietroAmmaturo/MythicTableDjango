
import json

from django.db import models

class Dice(models.Model):
    def __init__(self, element=None):
        if element:
            self.result = element['results'].Value
            self.formula = element['results'].Expression
            self.rolls = [Die(dr.NumSides, dr.Value) for dr in element['results'].Values if dr.NumSides > 0]
        else:
            self.result = 0
            self.formula = ""
            self.rolls = []

class Die(models.Model):
    def __init__(self, die: int, value: float):
        self.die = die
        self.value = value

class Element(models.Model):
    def __init__(self, error="", text="", results=None):
            self.error: str = error
            self.text: str = text
            self.results: Dice = results
            
    def __str__(self):
        return f"Element(error={self.error}, text={self.text}, results={self.results})"

class Chat(models.Model):
    def __init__(self, message: str = "", description: str = "", elements: list[Element] = [], dice: list[Dice] = []):
        self.message = message
        self.description = description
        self.elements = elements
        self.dice = dice
