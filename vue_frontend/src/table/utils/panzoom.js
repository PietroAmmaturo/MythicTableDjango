import { Animation } from 'konva';

import xy from './xy';

export default class PanZoom {
    constructor() {
        this.active = false;
        this.node = null;
        this.correctionAnim = new Animation(this.correctionAnimFn.bind(this));
        this.scale = 1;
        this.position = null;
        this.finish = null;
        this.lastRetargetTime = false;
    }

    startCorrection({ node, position, scale, finish }) {
        this.node = node;
        this.position = position;
        this.scale = scale;
        this.finish = finish;
        this.lastRetargetTime = true;

        if (!this.correctionAnim.isRunning()) {
            this.active = true;
            this.correctionAnim.start();
        }
    }

    // eslint-disable-next-line no-unused-vars
    correctionAnimFn({ time, timeDiff, lastTime }) {
        if (this.lastRetargetTime === true) {
            this.lastRetargetTime = time;
        }

        // Spend ~60ms making the correction using linear tween
        // XXX: Optimize cases where tween-frames are not sufficiently different
        const goal = this.lastRetargetTime + 250;
        const t = (time - this.lastRetargetTime) / (goal - this.lastRetargetTime);

        const tweenScale = xy(this.node.scale()).lerp(xy(this.scale, this.scale), t);

        this.node.position(xy(this.node.position()).lerp(this.position, t));
        this.node.scale(tweenScale);
        this.node.draw();

        if (time - this.lastRetargetTime > 250) {
            this.node.position(this.position);
            this.node.scale(xy(this.scale));
            this.correctionAnim.stop();
            this.active = false;
            this.finish();
        }
    }
}
