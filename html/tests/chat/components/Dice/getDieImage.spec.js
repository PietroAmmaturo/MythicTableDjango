import getDieImage from '@/chat/components/dice/getDieImage.js';

describe('getDieImage', () => {
    it('should return correct format', () => {
        expect(getDieImage(20, 'svg')).toBe('/static/icons/dice/SVG/d20.svg');
        expect(getDieImage(20, 'png50')).toBe('/static/icons/dice/50h/d2050h.png');
        expect(getDieImage(20, 'png100')).toBe('/static/icons/dice/100h/d20100h.png');
    });

    it('should default to .svg as the format', () => {
        expect(getDieImage(20)).toBe('/static/icons/dice/SVG/d20.svg');
    });

    it('should return correct image from die value', () => {
        expect(getDieImage(4)).toBe('/static/icons/dice/SVG/d4.svg');
        expect(getDieImage(6)).toBe('/static/icons/dice/SVG/d6.svg');
        expect(getDieImage(8)).toBe('/static/icons/dice/SVG/d8.svg');
        expect(getDieImage(10)).toBe('/static/icons/dice/SVG/d10.svg');
        expect(getDieImage(12)).toBe('/static/icons/dice/SVG/d12.svg');
        expect(getDieImage(20)).toBe('/static/icons/dice/SVG/d20.svg');
    });

    it('should display a d20 for non-standard polyhedrals', () => {
        expect(getDieImage(2)).toBe('/static/icons/dice/SVG/d20.svg');
        expect(getDieImage(11)).toBe('/static/icons/dice/SVG/d20.svg');
    });
});
