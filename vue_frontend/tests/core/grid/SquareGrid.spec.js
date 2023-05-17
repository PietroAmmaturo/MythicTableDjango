import SquareGrid from '@/core/grid/SquareGrid.js';

describe('SquareGrid', () => {
    test("has type 'square'", () => {
        const grid = new SquareGrid();
        expect(grid.type).toEqual('square');
    });

    it('has given size', () => {
        const size = 42;
        const grid = new SquareGrid(size);
        expect(grid.size).toEqual(size);
    });

    it('has default size of 50', () => {
        const grid = new SquareGrid();
        expect(grid.size).toEqual(50);
    });

    test.each([10, 15, 100])('defines dimensions in blueprint (size=%i)', size => {
        const mapping = new SquareGrid(size);
        const blueprint = mapping.blueprint;

        expect(blueprint.width).toBe(size);
        expect(blueprint.height).toBe(size);
    });

    describe('#base', () => {
        it('is self when no size modifiers are applied', () => {
            const grid = new SquareGrid();
            expect(grid.base).toBe(grid);
        });

        it('is not self when size modifier is applied', () => {
            const base = new SquareGrid(10);
            const modified = base.withSize(20);
            expect(base).not.toBe(modified);
        });

        it('maintains initial size', () => {
            const size = 42;
            let grid = new SquareGrid(size);
            grid = grid.withSize(size * 2);
            expect(grid.base.size).toEqual(size);
        });

        it('is sealed', () => {
            const grid = new SquareGrid();
            expect(Object.isSealed(grid.base)).toBeTruthy();
        });

        it('has scale of 1', () => {
            const grid = new SquareGrid();
            expect(grid.base.scale).toEqual(1);
        });
    });

    describe('#withSize()', () => {
        it('returns new grid space with given size', () => {
            const baseSize = 10;
            const newSize = 20;
            const baseGrid = new SquareGrid(baseSize);
            const newGrid = baseGrid.withSize(newSize);

            expect(newGrid).not.toBe(baseGrid);
            expect(newGrid.size).toEqual(newSize);
        });

        it('return the same object when given identical size', () => {
            const baseGrid = new SquareGrid();
            const newGrid = baseGrid.withSize(baseGrid.size);

            expect(newGrid).toBe(baseGrid);
        });

        it('does not deeply chain prototypes after repeated calls', () => {
            let grid = new SquareGrid();
            for (const size of [10, 20, 30, 40, 50, 60]) {
                grid = grid.withSize(size);
            }

            expect(Object.getPrototypeOf(Object.getPrototypeOf(grid))).not.toBeInstanceOf(SquareGrid);
        });

        it('returns sealed grid space', () => {
            const grid = new SquareGrid(10).withSize(20);
            expect(Object.isSealed(grid)).toBeTruthy();
        });

        test.each([
            [10, 20, 2],
            [10, 5, 0.5],
        ])('relative to base size %d, size %d has scale %d', (base, size, scale) => {
            const grid = new SquareGrid(base).withSize(size);
            expect(grid.scale).toEqual(scale);
        });
    });

    describe('mapping with size=10', () => {
        const grid = new SquareGrid(10);

        test.each([
            [
                { q: 0, r: 0 },
                { x: 5, y: 5 },
            ],
            [
                { q: 1, r: 2 },
                { x: 15, y: 25 },
            ],
            [
                { q: -1, r: -1 },
                { x: -5, y: -5 },
            ],
            [
                { q: 0, r: 0, px: 0.1, py: -0.1 },
                { x: 6, y: 4 },
            ],
            [
                { q: 1, r: 1, px: 0.2, py: -0.2 },
                { x: 17, y: 13 },
            ],
            [
                { q: 1, r: 1, pa: '00' },
                { x: 10, y: 10 },
            ],
            [
                { q: 1, r: 1, px: 0.3, py: -0.3, pa: '00' },
                { x: 10, y: 10 },
            ],
        ])('.gridToStage(%o) => %o', (pos, xy) => {
            expect(grid.gridToStage(pos)).toEqual(xy);
        });

        test.each([
            [
                { x: 5, y: 5 },
                { q: 0, r: 0 },
            ],
            [
                { x: -5, y: 15 },
                { q: -1, r: 1 },
            ],
            [
                { x: 0, y: 0 },
                { q: 0, r: 0, px: -0.5, py: -0.5 },
            ],
            [
                { x: 4, y: -2 },
                { q: 0, r: -1, px: 4 / 10 - 0.5, py: -2 / 10 + 0.5 },
            ],
        ])('.stageToGrid(%o) => %o', (xy, pos) => {
            expect(grid.stageToGrid(xy)).toStrictEqual(pos);
        });
    });

    describe('mapping with size=15', () => {
        const grid = new SquareGrid(15);

        test.each([
            [
                { q: 0, r: 0 },
                { x: 7.5, y: 7.5 },
            ],
            [
                { q: 1, r: 2 },
                { x: 22.5, y: 37.5 },
            ],
            [
                { q: -1, r: -1 },
                { x: -7.5, y: -7.5 },
            ],
            [
                { q: 1, r: 1, pa: '00' },
                { x: 15, y: 15 },
            ],
        ])('.gridToStage(%o) => %o', (pos, xy) => {
            expect(grid.gridToStage(pos)).toEqual(xy);
        });
    });

    describe('gridToStage() with anchor (size=10)', () => {
        test.each([
            ['00', { x: 0, y: 0 }],
            ['0', { x: 5, y: 5 }],
            ['nw', { x: 0, y: 0 }],
            ['ne', { x: 10, y: 0 }],
            ['se', { x: 10, y: 10 }],
            ['sw', { x: 0, y: 10 }],
        ])('%s => %o', (pa, xy) => {
            const mapping = new SquareGrid(10);
            expect(mapping.gridToStage({ q: 0, r: 0 }, pa)).toEqual(xy);
        });
    });

    describe('.gridToAnchor()', () => {
        const grid = new SquareGrid();

        describe('anchor to origin by default', () => {
            test.each([
                [
                    { q: 1, r: 2 },
                    { q: 1, r: 2 },
                ],
                [
                    { q: 3, r: 4, px: 0.0, py: -0.3 },
                    { q: 3, r: 4 },
                ],
                [
                    { q: 1, r: 2, px: 0.1 },
                    { q: 1, r: 2 },
                ],
                [
                    { q: 1, r: 2, py: 0.1 },
                    { q: 1, r: 2 },
                ],
            ])('%o => %o', (pos, anchored) => {
                expect(grid.gridToAnchor(pos)).toStrictEqual(anchored);
            });
        });

        describe('anchor to closest', () => {
            const anchors = ['nw', 'ne', 'se', 'sw'];

            test.each([
                [{ px: -0.2, py: -0.2 }, 'nw'],
                [{ px: 0.2, py: -0.2 }, 'ne'],
                [{ px: 0.2, py: 0.2 }, 'se'],
                [{ px: -0.2, py: 0.2 }, 'sw'],
            ])('%o closest to %s', (pxy, pa) => {
                const pos = Object.assign({ q: 0, r: 0 }, pxy);
                expect(grid.gridToAnchor(pos, anchors).pa).toEqual(pa);
            });
        });

        describe('anchor based on priority', () => {
            test.each([
                [['nw', 'se', 'ne', 'sw'], 'nw'],
                [['se', 'nw'], 'se'],
                [['sw', 'nw', 'se'], 'sw'],
            ])('%o prioritises %s', (anchors, pa) => {
                expect(grid.gridToAnchor({ q: 0, r: 0 }, anchors).pa).toEqual(pa);
            });
        });
    });
});
