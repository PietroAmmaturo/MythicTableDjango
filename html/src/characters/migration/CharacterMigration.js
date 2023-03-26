import { autoMigrate } from '@/core/migration/migrator.js';

const _migrations = [
    {
        version: '0.0.1',
        up: function(character) {
            if (!character.hasOwnProperty('macros')) {
                character.macros = [];
            } else if (!Array.isArray(character.macros)) {
                const faultyMacros = character.macros;
                character.macros = [];
                if (typeof faultyMacros === 'object') {
                    for (const [key, value] of Object.entries(faultyMacros)) {
                        const index = parseInt(key, 10);
                        if (!isNaN(index)) {
                            character.macros[key] = value;
                        }
                    }
                }
            }
            return character;
        },
        down: function(character) {
            return character;
        },
    },
];

export function migrateCharacter(character) {
    return autoMigrate(character, _migrations);
}
