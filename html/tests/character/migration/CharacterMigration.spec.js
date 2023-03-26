import { migrateCharacter } from '@/characters/migration/CharacterMigration.js';

describe('CharacterMigration', () => {
    it('adds version', () => {
        const character = {
            name: 'Arven',
        };
        // TODO: Expect any version
        expect(migrateCharacter(character)).toHaveProperty('version', '0.0.1');
    });

    it('adds macros', () => {
        const character = {
            name: 'Arven',
        };
        expect(migrateCharacter(character)).toHaveProperty('macros', []);
    });

    it('corrects object macros', () => {
        const character = {
            name: 'Arven',
            macros: {
                foo: 'bar',
            },
        };
        expect(migrateCharacter(character)).toHaveProperty('macros', expect.arrayContaining([]));
    });

    it('corrects object macros while preserving old macros', () => {
        const character = {
            name: 'Arven',
            macros: {
                foo: 'bar',
                '0': 'foo',
                '1': 'bar',
            },
        };
        expect(migrateCharacter(character)).toHaveProperty('macros', expect.arrayContaining(['foo', 'bar']));
    });

    it('updates the macros field if undefined', () => {
        const character = {
            name: 'Arven',
            macros: undefined,
        };
        expect(migrateCharacter(character)).toHaveProperty('macros', expect.arrayContaining([]));
    });

    it('does not alter functioning macros', () => {
        const character = {
            name: 'Arven',
            macros: ['foo', 'bar'],
        };
        expect(migrateCharacter(character)).toHaveProperty('macros', expect.arrayContaining(['foo', 'bar']));
    });
});
