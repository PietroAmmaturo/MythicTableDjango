/**
 * Provides common Cartesian space operations on an object having x-y values.
 *
 * This class is not intended to be used only through the {@link xy} function.
 * @param {number} x
 * @param {number} y
 */
// XXX: Doing a bit of aliasing shenanigans here for compactness
const cc = class Cartesian {
    /**
     *
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     *
     * @param {{x: number, y: number}} other
     */
    add({ x, y }) {
        return new cc(this.x + x, this.y + y);
    }

    /**
     *
     * @param {number} other.x
     * @param {number} other.y
     */
    subtract({ x, y }) {
        return new cc(this.x - x, this.y - y);
    }

    /**
     *
     * @param {number} n
     */
    multiply(n) {
        return new cc(this.x * n, this.y * n);
    }

    /**
     * Return the dot product of this coordinate and given coordinate.
     * @param {{x: number, y: number}} other
     */
    dot({ x, y }) {
        return this.x * x + this.y * y;
    }

    /**
     * Treat this coordinate as a vector and return its length.
     * @return {number}
     */
    length() {
        return Math.hypot(this.x, this.y);
    }

    /**
     *
     * @param {number} other.x
     * @param {number} other.y
     * @param {number} i - Interval
     */
    lerp({ x, y }, i) {
        return new cc((x - this.x) * i + this.x, (y - this.y) * i + this.y);
    }

    /**
     * Reflect coordinate value across the specified origin (default (0,0)).
     *
     * @param {{x: number, y: number}} [origin]
     */
    reflect(origin) {
        if (!origin) {
            return new cc(-this.x, -this.y);
        } else {
            const dx = this.x - origin.x;
            const dy = this.y - origin.y;
            return new cc(origin.x - dx, origin.y - dy);
        }
    }

    /**
     * Treat this coordinate as if it were a vector from origin, and return
     * its unit vector.
     *
     * If this vector has no length, return null.
     */
    unit() {
        const length = this.length();
        if (length == 0) {
            return null;
        }
        return this.multiply(1 / length);
    }
};

/**
 *
 * @param {{x: number, y: number}|number} [xy]
 * @param {number} [y]
 * @returns {cc}
 */
const xy = function(xy, y) {
    if (xy instanceof cc) {
        return xy;
    }

    if (typeof xy === 'object') {
        return new cc(xy.x || 0, xy.y || 0);
    }

    return new cc(xy || 0, y || 0);
};

export { xy as default, cc as Cartesian };
