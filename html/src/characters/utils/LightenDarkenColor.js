// in: r,g,b in [0,1], out: h in [0,360) and s,l in [0,1]
function rgb2hsl(r, g, b) {
    let a = Math.max(r, g, b),
        n = a - Math.min(r, g, b),
        f = 1 - Math.abs(a + a - n - 1);
    let h = n && (a == r ? (g - b) / n : a == g ? 2 + (b - r) / n : 4 + (r - g) / n);
    return [60 * (h < 0 ? h + 6 : h), f ? n / f : 0, (a + a - n) / 2];
}

// input: h in [0,360] and s,v in [0,1] - output: r,g,b in [0,1]
function hsl2rgb(h, s, l) {
    let a = s * Math.min(l, 1 - l);
    let f = (n, k = (n + h / 30) % 12) => l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return [f(0), f(8), f(4)];
}

function LightenDarkenColor(colorCode, amount) {
    var usePound = false;

    if (colorCode[0] == '#') {
        colorCode = colorCode.slice(1);
        usePound = true;
    }

    var num = parseInt(colorCode, 16);

    var r = (num >> 16) + amount;

    if (r > 255) {
        r = 255;
    } else if (r < 0) {
        r = 0;
    }

    var b = ((num >> 8) & 0x00ff) + amount;

    if (b > 255) {
        b = 255;
    } else if (b < 0) {
        b = 0;
    }

    var g = (num & 0x0000ff) + amount;

    if (g > 255) {
        g = 255;
    } else if (g < 0) {
        g = 0;
    }

    const hsl = rgb2hsl(r / 255, g / 255, b / 255);

    hsl[2] = hsl[2] * (1 + amount / 2) + amount / 2;

    if (hsl[2] > 1) hsl[2] = 1;
    if (hsl[2] < 0) hsl[2] = 0;

    const rgb = hsl2rgb(hsl[0], hsl[1], hsl[2]);

    return (
        (usePound ? '#' : '') +
        (Math.round(rgb[1] * 255) | (Math.round(rgb[2] * 255) << 8) | (Math.round(rgb[0] * 255) << 16))
            .toString(16)
            .padStart(6, '0')
    );
}

export default LightenDarkenColor;
