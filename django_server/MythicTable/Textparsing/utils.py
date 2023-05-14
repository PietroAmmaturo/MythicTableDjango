import re
import random
from .models import Element, RollerElement, ErrorElement, Die, RollResult, Chat, Dice
class ChatParser:
    def __init__(self):
        self.pattern = r'\d+'
        self.pattern_ex = r'formula:\s*([\w+\-*\/\s]+)'

    def parse_and_roll_dice(self, message):
        try:
            numbers = re.findall(self.pattern, message)
            expressions = re.findall(self.pattern_ex, message)
            print("formula: ", expressions)
            ex = "x" if len(expressions) == 0 else expressions[0]
            print("actual formula: ", ex)
            if len(numbers) >= 2:
                n = int(numbers[0])
                m = int(numbers[1])
                print(n, m)
                rolls = [Die(die = n, value = self.apply_formula(ex, random.randint(1, m))) for _ in range(n)]
                result = sum(roll.value for roll in rolls)
                return Chat(message=message, elements= [Element(text=message), RollerElement(text=message, results=RollResult(value=result, expression=ex, values=rolls))], dice=[Dice(result=result, formula=ex, rolls=rolls)])
            else:
                return Chat(message=message, elements= [Element(text=message)])
        except Exception as e:
            print(f"Exception occurred: {str(e)}")
            return Chat(message=message, elements= [ErrorElement(text=message, error="Could not parse and roll dice"), Element(text="Could not parse and roll dice")])
        
    def apply_formula(self, formula, number):
        print("rolling")
        try:
            print("rolling: ", formula, number)
            result = eval(formula, {'x': number})
            return result
        except Exception:
            raise ValueError("Invalid formula")