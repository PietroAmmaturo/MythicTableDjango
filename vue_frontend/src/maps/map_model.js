export default {
    name: 'New Map',
    map: { stage: '.' },
    stage: {
        grid: { type: 'square', size: 50, thickness: 2, color: '#000', lineFullness: 0.35, offset: { x: 0, y: 0 } },
        bounds: {
            nw: { q: 0, r: 0 },
            se: { q: 20, r: 20 },
        },
        elements: [],
    },
};

export const defaultElement = {
    id: 'background',
    asset: {
        kind: 'image',
        src: '/static/assets/tutorial/thank-you.jpg',
    },
    pos: { q: 0, r: 0, pa: '00' },
};
