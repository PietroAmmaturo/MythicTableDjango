import EntityStore from '@/store/EntityStore';

describe('EntityStore', () => {
    describe('getters', () => {
        describe('getEntityByRef()', () => {
            const getEntityByRef = EntityStore.getters.getEntityByRef;
            const state = {
                foo: { id: 'foo', other: 'bar' },
                bar: { id: 'bar' },
            };

            it('returns entity by ID if no base is given', () => {
                const result = getEntityByRef(state)('foo');
                expect(result).toBe(state['foo']);
            });

            it('returns undefined-equivalent if entity is not found', () => {
                const result = getEntityByRef(state)('notfound');
                expect(result).toEqual(undefined);
            });

            describe('... with concrete base', () => {
                it('returns correct entity', () => {
                    const result = getEntityByRef(state)('foo', state['bar']);
                    expect(result).toBe(state['foo']);
                });

                it("returns same entity if ref is '.'", () => {
                    const entity = state['foo'];
                    const result = getEntityByRef(state)('.', entity);
                    expect(result).toBe(entity);
                });
            });

            describe('... with only base ID', () => {
                it('returns correct entity', () => {
                    const result = getEntityByRef(state)('foo', 'bar');
                    expect(result).toBe(state['foo']);
                });

                it("returns same entity if ref is '.'", () => {
                    const result = getEntityByRef(state)('.', 'foo');
                    expect(result).toBe(state['foo']);
                });
            });
        });
    });
});
