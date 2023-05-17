import getAllImages from '@/maps/components/MapHelper.js';

const maps = [
    {
        _id: 'debug',
        map: { stage: '.' },
        stage: {
            grid: { type: 'square', size: 50 },
            bounds: {
                nw: { q: -1, r: -1 },
                se: { q: 29, r: 20 },
            },
            color: '#223344',
            elements: [
                {
                    id: 'background',
                    asset: { kind: 'image', src: '/static/assets/tutorial/thank-you.jpg' },
                    pos: { q: 0, r: 0, pa: '00' },
                },
            ],
        },
    },
];

const expectedImages = {
    debug: {
        id: 'background',
        asset: { kind: 'image', src: '/static/assets/tutorial/thank-you.jpg' },
    },
};

describe('GameMat component', () => {
    describe('map conversion', () => {
        it('should pull images from map description', () => {
            const images = getAllImages(maps);
            expect(images).toEqual(expectedImages);
        });
    });
});

describe('MapHelper', () => {
    it('Should skip null element entries', () => {
        const maps = getAllImages([
            {
                _id: '1',
                stage: {
                    elements: [null, { id: 1, asset: 'hi' }, null, { id: 3, asset: 'there' }, null],
                },
            },
        ]);
        expect(maps).toEqual({ '1': { id: 3, asset: 'there' } });
    });
});
