export default class SquareGrid {
    constructor(size) {
        this.type = 'square';

        this.init(size || 50);
    }

    init(size) {
        this.size = size;
        this.blueprint = {
            width: size,
            height: size,
        };
        this.scale = this.size / this.base.size;
        Object.seal(this);
        return this;
    }

    /**
     * The base grid space, without any size modifier
     */
    get base() {
        const proto = Object.getPrototypeOf(this);
        return proto instanceof SquareGrid ? proto : this;
    }

    /**
     * Create a new grid space object of the same type with the given size.
     *
     * @param {number} size
     */
    withSize(size) {
        if (size == this.size) {
            return this;
        }

        return Object.create(this.base).init(size);
    }

    /**
     * Convert given stage coordinates to grid position
     *
     * @param {number} pos.x
     * @param {number} pos.y
     */
    stageToGrid(pos) {
        let px = pos.x / this.size;
        let py = pos.y / this.size;

        const qr = {
            q: Math.floor(px),
            r: Math.floor(py),
        };

        px -= 0.5 + qr.q;
        py -= 0.5 + qr.r;

        if (px) {
            qr.px = px;
        }

        if (py) {
            qr.py = py;
        }

        return qr;
    }

    /**
     * Convert given grid position to stage coordinates
     *
     * @param {number} pos.q
     * @param {number} pos.r
     * @param {string} [pos.pa=0] - Well-known position anchor within grid cell to return screen position for.
     * @param {string} [pa=0] - If given, return stage position for this well-known position anchor instead.
     */
    gridToStage(pos, pa) {
        if (process.env.NODE_ENV !== 'production') {
            if (pos.pa && (pos.px || pos.py)) {
                console.warn('grid position offsets are ignored if anchor is also defined');
            }
        }

        const xy = {
            x: pos.q * this.size,
            y: pos.r * this.size,
        };

        switch (pa || pos.pa) {
            case '00':
            case 'nw':
                break;
            case 'ne':
                xy.x += this.blueprint.width;
                break;
            case 'sw':
                xy.y += this.blueprint.height;
                break;
            case 'se':
                xy.x += this.blueprint.width;
                xy.y += this.blueprint.height;
                break;
            default:
                console.warn(`Unknown anchor point '${pos.pa}' for grid type '${this.type}': using '0'.`);
                break;
            case undefined:
            case '0':
                xy.x += this.size / 2 + (pos.px || 0) * this.size;
                xy.y += this.size / 2 + (pos.py || 0) * this.size;
                break;
        }

        return xy;
    }

    /**
     * Convert a grid position to an anchored one.
     *
     * If `anchors` is given, return a new position that is 'snapped' to the nearest
     * anchor in the list. If multiple anchor points are equidistant, break ties using
     * the order they appear in the list (earlier wins).
     *
     * If `anchors` is not given, `0` is used as the anchor. This is equivalent to
     * simply removing offset and anchor properties.
     *
     * @param {*} pos - A grid position object
     * @param {string[]} [anchors=["0"]] - Anchor points to align to, in priority order
     */
    gridToAnchor(pos, anchors) {
        if (!anchors) {
            return { q: pos.q, r: pos.r };
        }

        let pickedAnchor;

        if (anchors.length === 1) {
            pickedAnchor = anchors[0];
        } else {
            const dsqToAnchors = anchors.map(pa => {
                let dx = pos.px || 0,
                    dy = pos.py || 0;
                switch (pa) {
                    case '0':
                        break;
                    case '00':
                    case 'nw':
                        dx += 0.5;
                        dy += 0.5;
                        break;
                    case 'ne':
                        dx = 0.5 - dx;
                        dy += 0.5;
                        break;
                    case 'se':
                        dx = 0.5 - dx;
                        dy = 0.5 - dy;
                        break;
                    case 'sw':
                        dx += 0.5;
                        dy = 0.5 - dy;
                        break;
                    default:
                        if (process.env.NODE_ENV !== 'production') {
                            console.warn(`Invalid anchor for ${this.type}: ${pa}`);
                        }
                }
                return { pa, d: dx * dx + dy * dy };
            });

            let dMin = Number.MAX_VALUE;
            for (const { pa, d } of dsqToAnchors) {
                if (d < dMin) {
                    pickedAnchor = pa;
                    dMin = d;
                }
            }
        }

        const result = {
            q: pos.q,
            r: pos.r,
        };

        if (pickedAnchor !== '0') {
            result.pa = pickedAnchor;
        }

        return result;
    }
}
