class Chat:
    def __init__(self, message="", description="", elements=[], dice=[]):
        self.Message = message
        self.Description = description
        self.Elements = elements
        self.Dice = dice


class Dice:
    def __init__(self, element=None):
        if element:
            self.Result = element.Results.Value
            self.Formula = element.Results.Expression
            self.Rolls = [Die(dr.NumSides, dr.Value) for dr in element.Results.Values if dr.NumSides > 0]
        else:
            self.Result = 0.0
            self.Formula = ""
            self.Rolls = []


class Die:
    def __init__(self, die=0, value=0.0):
        self.Die = die
        self.Value = value


class Element:
    def __init__(self, error="", text="", results=None):
        self.Error = error
        self.Text = text
        self.Results = Dice(results) if results else None