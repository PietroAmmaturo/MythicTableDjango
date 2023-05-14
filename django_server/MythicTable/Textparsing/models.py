
import json

from django.db import models

class Die(models.Model):
    def __init__(self, die: int, value: float):
        self.die = die
        self.value = value

class Dice(models.Model):
    def __init__(self, result: float, formula: str,  rolls=[]):
        self.result = result
        self.formula = formula
        self.rolls: list[Die] = rolls

class RollResult(models.Model):
    def __init__(self, value:float, expression: str, values=[]):
        self.value: float = value
        self.expression: str = expression
        self.values: list[Die] = values
    
class Element(models.Model):
    def __init__(self, text=""):
            self.text: str = text
            
    def __str__(self):
        return f"Element(text={self.text})"

class ErrorElement(Element):
    def __init__(self, error="", text=""):
            super().__init__(text=text)
            self.error: str = error

class RollerElement(Element):
    def __init__(self, text="", results=[], index=0):
            super().__init__(text=text)
            self.results: RollResult= results
            self.index: int= index

class Chat(models.Model):
    def __init__(self, message: str = "", description: str = "", elements: list[Element] = [], dice: list[Dice] = []):
        self.message = message
        self.description = description
        self.elements = elements
        self.dice = dice
