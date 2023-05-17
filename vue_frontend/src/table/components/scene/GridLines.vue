<template>
    <v-group ref="gridOrigin" :config="gridOriginConfig">
        <v-rect ref="grid" :config="gridRectConfig" />
    </v-group>
</template>

<script>
import { mapState } from 'vuex';

import { renderGridTile } from './grid/render.js';

export default {
    props: {
        gridConfig: {
            type: Object,
            required: true,
        },
        stageScale: {
            type: Number,
            required: true,
        },
    },
    data() {
        return {
            gridOrigin: {
                x: 0,
                y: 0,
            },
            stageOffset: {
                x: 0,
                y: 0,
            },
            baseGridRenderSize: 200,
        };
    },
    computed: {
        ...mapState('grid', {
            isGridFinding: 'active',
        }),
        ...mapState('window', {
            windowSize: 'windowSize',
        }),
        gridOriginConfig() {
            return {
                position: this.gridOrigin,
            };
        },
        gridRectConfig() {
            const { canvas, offset } = renderGridTile({
                width: this.baseGridRenderSize,
                height: this.baseGridRenderSize,
                thickness: 6,
                size: this.gridFullness,
                color: this.visible ? this.gridConfig.color : '#00000000',
            });

            const config = {
                width: this.width,
                height: this.height,
                position: {
                    x: this.gridConfig.offset?.x ?? 0,
                    y: this.gridConfig.offset?.y ?? 0,
                },
                fillPatternOffset: {
                    x: Math.round(offset.x),
                    y: Math.round(offset.y),
                },
                scale: {
                    x: this.scaleBaseGridSize,
                    y: this.scaleBaseGridSize,
                },
                fillPatternImage: canvas,
                listening: false,
            };

            // We need to manually call fillPatternImage here because Konva can't respond
            // to the image size changing without the image element itself changing
            const node = this.$refs.grid?.getNode?.();
            if (node) {
                node.fillPatternImage(canvas);
            }

            return config;
        },
        width() {
            const oversizeGridByGridTiles = 13 * this.gridSize;
            const canvasPixelsDisplayedByWindow = this.windowSize.width / this.stageScale;
            const oversizedGridWithBaseScaling = canvasPixelsDisplayedByWindow + oversizeGridByGridTiles;
            const oversizedGridWithoutBaseScaling = oversizedGridWithBaseScaling / this.scaleBaseGridSize;
            return oversizedGridWithoutBaseScaling;
        },
        height() {
            const oversizeGridByGridTiles = 13 * this.gridSize;
            const canvasPixelsDisplayedByWindow = this.windowSize.height / this.stageScale;
            const oversizedGridWithBaseScaling = canvasPixelsDisplayedByWindow + oversizeGridByGridTiles;
            const oversizedGridWithoutBaseScaling = oversizedGridWithBaseScaling / this.scaleBaseGridSize;
            return oversizedGridWithoutBaseScaling;
        },
        gridSize() {
            return this.gridConfig?.size ?? 50;
        },
        gridFullness() {
            return this.gridConfig?.lineFullness ?? 0.2;
        },
        scaleBaseGridSize() {
            return this.gridSize / this.baseGridRenderSize;
        },
        visible: function() {
            if (this.isGridFinding) {
                return true;
            }
            return this.gridConfig?.visible ?? true;
        },
    },
    watch: {
        gridConfig: {
            handler: function() {
                this.relativeStagePosition();
            },
            deep: true,
            immediate: true,
        },
    },
    methods: {
        relativeStagePosition() {
            this.setRelativeStageOrigin();
        },
        setRelativeStageOrigin() {
            const stageOriginRelativeToCanvas = this.getStageOriginRelativeToCanvas();
            this.gridOrigin = this.findGridOrigin(stageOriginRelativeToCanvas);
        },
        getStageOriginRelativeToCanvas() {
            const stage = this.$refs.gridOrigin?.getNode().getStage();
            const transformRelativeToStage = stage?.getAbsoluteTransform().copy();
            transformRelativeToStage?.invert();
            const stageOrigin = { x: 0, y: 0 };
            return transformRelativeToStage?.point(stageOrigin) ?? { x: 0, y: 0 };
        },
        findGridOrigin(stageOriginOnCanvas) {
            return {
                x: this.calculateAxisOfGridOriginFromStageOrigin(stageOriginOnCanvas.x),
                y: this.calculateAxisOfGridOriginFromStageOrigin(stageOriginOnCanvas.y),
            };
        },
        calculateAxisOfGridOriginFromStageOrigin(axisPoint) {
            return axisPoint - this.relateGridToTokens(axisPoint) - this.moveGridOffscreenXGridTiles(6);
        },
        relateGridToTokens(axisPoint) {
            return axisPoint % this.gridSize;
        },
        moveGridOffscreenXGridTiles(offscreenTiles) {
            return offscreenTiles * this.gridSize;
        },
    },
};
</script>
