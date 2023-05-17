export default (die, format = 'svg') => {
    let validDice = [4, 6, 8, 10, 12, 20];
    let path;
    let suffix;
    if (format == 'png50') {
        suffix = '50h.png';
        path = '/static/icons/dice/50h/d';
    }
    if (format == 'png100') {
        suffix = '100h.png';
        path = '/static/icons/dice/100h/d';
    }
    if (format == 'svg') {
        suffix = '.svg';
        path = '/static/icons/dice/SVG/d';
    }

    if (validDice.includes(Number(die))) return path + die + suffix;

    return path + '20' + suffix;
};
