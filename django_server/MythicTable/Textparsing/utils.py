import re
import random
from .models import Element, RollerElement, ErrorElement, Die, RollResult, Chat, Dice
class ChatParser:
    def __init__(self):
        self.pattern_roll = r'\d+'
        self.pattern_ex = r'\b\d+d\d+\b'
        
    def apply_formula(self, formula, number):
        try:
            result = eval(formula, {'x': number})
            return result
        except Exception:
            raise ValueError("Invalid formula")
        
    def parse(self, message):
        try:
            series_of_rolls = []
            rolls = []
            found = False
            for result in re.findall(self.pattern_ex, message):
                found = True
                roll = re.findall(self.pattern_roll, result)
                num_dice = int(roll[0])
                num_faces = int(roll[1])
                identical_rolls = [Die(die=num_dice, value=random.randint(1, num_faces)) for _ in range(num_dice)]
                rolls.extend(identical_rolls)
                series_of_rolls.append(sum(roll.value for roll in identical_rolls))
            if found:
                result = eval(self.replace(message, series_of_rolls))
                return Chat(message=message, elements= [RollerElement(text=message, results=RollResult(value=result, expression=message, values=rolls))], dice=[Dice(result=result, formula=message, rolls=rolls)])
            else:
                return Chat(message=message, elements= [Element(text=message)])
        except Exception as e:
            return Chat(message=message, elements= [ErrorElement(text=message, error="Could not roll dice, please use a valid expression")])
    
    def replace(self, expression, values):
        def replace_match(match):
            n = int(match.group(1))
            m = int(match.group(2))
            return str(values.pop(0))
        
        pattern = r'(\d+)d(\d+)'
        result = re.sub(pattern, replace_match, expression)
        return result

