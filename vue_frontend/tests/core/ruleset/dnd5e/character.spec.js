import { PlayerCharacter } from '@/core/ruleset/dnd5e/character';

describe('PlayerCharacter', () => {
    describe('.activeEffects', () => {
        it('changes when effect is activated', () => {
            const player = new PlayerCharacter({
                data() {
                    return {
                        effects: [{ active: false }],
                    };
                },
            });

            expect(player.activeEffects).toEqual([]);

            player.effects[0].active = true;

            expect(player.activeEffects.length).toBe(1);
        });

        it('changes when effect is deactivated', () => {
            const player = new PlayerCharacter({
                data() {
                    return {
                        effects: [{ active: true }],
                    };
                },
            });

            expect(player.activeEffects.length).toBe(1);

            player.effects[0].active = false;

            expect(player.activeEffects).toEqual([]);
        });
    });

    describe('effects application', () => {
        it('modifiers are added based on effects', async () => {
            const player = new PlayerCharacter();

            expect(player.chart['foo[]']).toBeFalsy();

            const effect = {
                modifiers: { foo: {} },
                active: true,
            };
            player.effects.push(effect);

            await player.$nextTick();

            expect(player.chart['foo[]']).toEqual([effect]);
        });

        it('modifiers are removed when corresponding effect is disabled', async () => {
            const effect = {
                modifiers: { foo: {} },
                active: true,
            };

            const player = new PlayerCharacter();
            player.effects.push(effect);

            await player.$nextTick();

            expect(player.chart['foo[]']).toHaveLength(1);

            player.effects[0].active = false;

            await player.$nextTick();

            expect(player.chart['foo[]']).toHaveLength(0);
        });
    });
});
