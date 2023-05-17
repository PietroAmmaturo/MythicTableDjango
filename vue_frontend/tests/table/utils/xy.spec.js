import xy from '@/table/utils/xy';

describe('xy()', () => {
    it('accepts object', () => {
        const pt = xy({ x: 12, y: 15 });
        expect(pt).toEqual({ x: 12, y: 15 });
    });

    it('accepts separate x-y values', () => {
        const pt = xy(13, 14);
        expect(pt).toEqual({ x: 13, y: 14 });
    });

    it('defaults undefined coordinate to 0', () => {
        expect(xy()).toEqual({ x: 0, y: 0 });
    });

    it('returns same object if given xy', () => {
        const pt = xy(1, 2);
        expect(xy(pt)).toBe(pt);
    });
});

describe('add()', () => {
    test.each([
        [0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 1],
        [1, 1, 0, 0, 1, 1],
        [2, 3, -1, 10, 1, 13],
    ])('(%d,%d) + (%d,%d) => (%d,%d)', (x1, y1, x2, y2, xs, ys) => {
        expect(xy({ x: x1, y: y1 }).add({ x: x2, y: y2 })).toEqual({ x: xs, y: ys });
    });
});

describe('subtract()', () => {
    test.each([
        [0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, -1, -1],
        [1, 1, 0, 0, 1, 1],
        [2, 3, -1, 10, 3, -7],
    ])('(%d,%d) - (%d,%d) => (%d,%d)', (x1, y1, x2, y2, rx, ry) => {
        expect(xy({ x: x1, y: y1 }).subtract({ x: x2, y: y2 })).toEqual({ x: rx, y: ry });
    });
});

describe('multiply()', () => {
    test.each([
        [1, 1, 0, 0, 0],
        [2, 3, 1, 2, 3],
        [2, 3, -1, -2, -3],
        [1, 2, 0.5, 0.5, 1],
    ])('(%d,%d) * %d => (%d,%d)', (x1, y1, n, rx, ry) => {
        expect(xy({ x: x1, y: y1 }).multiply(n)).toEqual({ x: rx, y: ry });
    });
});

describe('dot()', () => {
    test.each([
        [1, 1, 0, 0, 0],
        [1, 0, 0, 1, 0],
        [1, 0, 0, -1, 0],
        [1, 2, 3, 4, 11],
    ])('(%d,%d) . (%d,%d) => (%d,%d)', (x1, y1, x2, y2, n) => {
        expect(xy({ x: x1, y: y1 }).dot({ x: x2, y: y2 })).toEqual(n);
    });
});

describe('length()', () => {
    test.each([
        [1, 0, 1],
        [0, 1, 1],
        [-1, 0, 1],
        [1, 1, Math.sqrt(2)],
        [3, -4, 5],
    ])('|(%d,%d)| => %d', (x, y, l) => {
        expect(xy({ x, y }).length()).toEqual(l);
    });
});

describe('lerp()', () => {
    test.each([
        [0, 0, 0, 1, 1, 0, 0],
        [0, 0, 0.5, 1, 1, 0.5, 0.5],
        [0, 0, 1, 1, 1, 1, 1],
    ])('(%d,%d) ->%d-> (%d,%d) => (%d,%d)', (x1, y1, n, x2, y2, rx, ry) => {
        expect(xy({ x: x1, y: y1 }).lerp({ x: x2, y: y2 }, n)).toEqual({ x: rx, y: ry });
    });
});

describe('reflect()', () => {
    test.each([
        [0, 0, -0, -0], // TODO: Normalize this case to (0,0)?
        [1, 1, -1, -1],
        [-2, 3, 2, -3],
    ])('reflect (%d,%d) => (%d,%d', (x, y, rx, ry) => {
        expect(xy({ x, y }).reflect()).toEqual({ x: rx, y: ry });
    });

    test.each([
        [1, 1, 0, 0, -1, -1],
        [1, 1, -1, -1, -3, -3],
        [1, 1, 1, 0, 1, -1],
    ])('reflect (%d,%d) about (%d,%d) => (%d,%d', (x, y, px, py, rx, ry) => {
        expect(xy({ x, y }).reflect({ x: px, y: py })).toEqual({ x: rx, y: ry });
    });
});

describe('unit()', () => {
    it('returns null if vector has no length', () => {
        expect(xy().unit()).toBeNull();
    });

    test.each([
        [0, 1, 0, 1],
        [1, 0, 1, 0],
        [1, 1, 1 / Math.sqrt(2), 1 / Math.sqrt(2)],
    ])('unit vector of (%d,%d) => (%d,%d)', (x, y, rx, ry) => {
        expect(xy({ x, y }).unit()).toEqual({ x: rx, y: ry });
    });
});
