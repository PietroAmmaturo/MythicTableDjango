import random
import string
import uuid

    
class IdGenerator:
    def __init__(self, options=None):
        self.options = options
        self.random = random.Random(options.Seed) if options and options.Seed != 0 else random.Random()

    def generate(self):
        results = str(uuid.uuid4())
        if self.options:
            if not self.options.Characters:
                return results[:self.options.Length]
            return ''.join(self.random.choice(self.options.Characters) for _ in range(self.options.Length))
        return results

class Options:
    def __init__(self, length=6, characters="23456789BCDFGHJKLMNPQWRSTVWXYZ", seed=0):
        self.Length = length
        self.Characters = characters
        self.Seed = seed

    @staticmethod
    def join():
        return Options()

class CampaignJoinIdGenerator():
    id_generator = IdGenerator(Options.join())

    @staticmethod
    def generate():
        return CampaignJoinIdGenerator.id_generator.generate()