// File that contains action data
let actions = {
    increment: {
        id: 'increment',
        description: 'Increment counter',
        action: '@counter = @counter + 1',
    },
    decrement: {
        id: 'decrement',
        description: 'Decrement counter',
        action: '@counter = @counter - 1',
    },
    attack: {
        id: 'attack',
        action: [
            'bool hit = (1d20 + @origin.strBonus + @origin.prof) >= @target.ac',
            'int damage = @origin.weapon.damage + @origin.strBonus if hit',
            '@target.hp = @target.hp - damage',
        ],
    },
};

export default actions;
