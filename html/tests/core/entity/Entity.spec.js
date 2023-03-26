import Entity from '@/core/entity/Entity';

describe('Entity', () => {
    describe('ctor', () => {
        it('accepts only ID', () => {
            const entity = new Entity('foo');
            expect(entity.id).toBe('foo');
        });

        it('accepts initializer object', () => {
            const props = {
                id: 'foo',
                comp1: 'value',
                comp2: { p: 'child' },
            };

            const entity = new Entity(props);
            expect(entity).toMatchObject(props);
        });

        it('rejects initializer object without id', () => {
            expect(() => new Entity({ foo: 'bar' })).toThrow();
        });

        test.each([0, true, false, null, [], {}])('rejects unacceptable argument: %j', arg => {
            expect(() => {
                new Entity(arg);
            }).toThrow();
        });

        test.each([0, true, false, null, [], {}])('rejects bad IDs: %j', id => {
            expect(() => {
                new Entity({ id });
            }).toThrow();
        });
    });

    it('has metadata object', () => {
        const entity = new Entity('test');
        expect(entity[Entity.meta]).toBeDefined();
    });
});
