<template>
    <v-group
        ref="group"
        :config="tokenConfig"
        @dragend="onDragend($event)"
        @click="onClick()"
        @dblclick="onDoubleClick()"
    >
        <v-circle
            id="selectedCircle"
            v-if="(borderMode === 'coin' || borderMode === 'circle') && selected"
            :config="selectCircleConfig"
        />
        <v-rect
            id="selectedSquare"
            v-if="(borderMode === 'tile' || borderMode === 'square' || !borderMode) && selected"
            :config="selectSquareConfig"
        />

        <v-circle id="outerContainerCircle" v-if="borderMode === 'coin'" :config="outerContainerConfig" />
        <v-circle id="middleContainerCircle" v-if="borderMode === 'coin'" :config="middleContainerConfig" />
        <v-circle id="innerContainerCircle" v-if="borderMode === 'coin'" :config="innerContainerConfig" />
        <v-circle id="innerBGCircle" v-if="borderMode === 'coin'" :config="innerBGConfig" />

        <v-rect id="outerContainerSquare" v-if="borderMode === 'tile'" :config="outerContainerConfig" />
        <v-rect id="outerContainerSquare" v-if="borderMode === 'tile'" :config="middleContainerConfig" />
        <v-rect id="outerContainerSquare" v-if="borderMode === 'tile'" :config="innerContainerConfig" />
        <v-rect id="outerContainerSquare" v-if="borderMode === 'tile'" :config="innerBGConfig" />

        <v-group id="tokenGroup" :config="clipConfig">
            <v-image id="image" :name="entity._id" v-if="entity.image" :config="imageConfig" />
            <component
                v-else
                v-bind:is="shapeConfig.type"
                :config="shapeConfig.config"
                @click="onClick()"
                @dblclick="onDoubleClick()"
            />
        </v-group>
        <v-group :config="iconContainerConfig" v-if="entity.icon">
            <v-circle :config="iconCircleConfig" />
            <v-text :config="iconTextConfig" />
        </v-group>
    </v-group>
</template>

<script>
import { mapActions } from 'vuex';
import LightenDarkenColor from '../utils/LightenDarkenColor.js';

const borderWidth = 1.5;

function setOffsetAtCenter(shapeDimensions) {
    return { offsetX: shapeDimensions.width / 2, offsetY: shapeDimensions.height / 2 };
}

export default {
    props: {
        entity: {
            type: Object,
            required: true,
        },
        selectedProp: {
            type: Boolean,
            required: false,
        },
        gridSize: {
            type: Number,
            default: 50,
        },
    },
    data: function() {
        return {
            selected: this.selectedProp,
            imageSizeCache: null,
        };
    },
    computed: {
        borderMode() {
            if (this.entity.borderMode) {
                return this.entity.borderMode;
            } else {
                return 'square';
            }
        },
        sizeMultiplier() {
            if (this.entity.tokenSize == 1) {
                return 0.75;
            } else if (this.entity.tokenSize == 2) {
                return 1;
            } else if (this.entity.tokenSize == 3) {
                return 2;
            } else if (this.entity.tokenSize == 4) {
                return 3;
            } else {
                return 1;
            }
        },
        tokenSize() {
            return this.sizeMultiplier * this.gridSize;
        },
        tokenConfig() {
            return {
                draggable: true,
                position: this.gridPosToPixels(this.entity.pos, this.gridSize),
                opacity: this.tokenOpacity,
            };
        },
        isHidden() {
            return this.entity.private ?? false;
        },
        tokenOpacity() {
            return this.isHidden ? 0.5 : 1;
        },
        selectCircleConfig: function() {
            return {
                ...this.setDimensionsPlusOffset(borderWidth * 2),
                ...this.setPositionAtCenter(),
                fill: '#7F7',
                opacity: 0.75,
                fillEnabled: true,
            };
        },
        selectSquareConfig: function() {
            const size = this.setDimensionsPlusOffset(borderWidth * 2);
            return {
                ...size,
                ...setOffsetAtCenter(size),
                ...this.setPositionAtCenter(),
                fill: '#7F7',
                opacity: 0.75,
                fillEnabled: true,
            };
        },
        outerContainerConfig: function() {
            const color = this.entity.borderColor ? this.entity.borderColor : '#a19271';
            const size = this.setDimensionsPlusOffset(0);
            if (this.borderMode === 'coin') {
                return {
                    ...size,
                    ...this.setPositionAtCenter(),
                    fillLinearGradientColorStops: [
                        0,
                        LightenDarkenColor(color, -0.3),
                        0.5,
                        LightenDarkenColor(color, -0.2),
                        1,
                        LightenDarkenColor(color, 0.4),
                    ],
                    fillLinearGradientStartPoint: {
                        x: 0,
                        y: -this.tokenSize * 0.5,
                    },
                    fillLinearGradientEndPoint: {
                        x: 0,
                        y: this.tokenSize * 0.5,
                    },
                    fillEnabled: true,
                };
            }
            if (this.borderMode === 'tile') {
                return {
                    ...size,
                    ...this.setPositionAtCenter(),
                    ...setOffsetAtCenter(size),
                    fillLinearGradientColorStops: [
                        0,
                        LightenDarkenColor(color, -0.2),
                        0.49,
                        LightenDarkenColor(color, -0.2),
                        0.51,
                        LightenDarkenColor(color, 0.4),
                        1,
                        LightenDarkenColor(color, 0.4),
                    ],
                    fillLinearGradientStartPoint: {
                        x: this.tokenSize,
                        y: 0,
                    },
                    fillLinearGradientEndPoint: {
                        x: 0,
                        y: this.tokenSize,
                    },
                    fillEnabled: true,
                };
            }
            return {};
        },
        middleContainerConfig: function() {
            const color = this.entity.borderColor ? this.entity.borderColor : '#a19271';
            const size = this.setDimensionsPlusOffset(-borderWidth);
            if (this.borderMode === 'coin') {
                return {
                    ...size,
                    ...this.setPositionAtCenter(),
                    fill: color,
                    fillEnabled: true,
                };
            }
            if (this.borderMode === 'tile') {
                return {
                    ...size,
                    ...this.setPositionAtCenter(),
                    ...setOffsetAtCenter(size),
                    fill: color,
                    fillEnabled: true,
                };
            }
            return {};
        },
        innerContainerConfig: function() {
            const color = this.entity.borderColor ? this.entity.borderColor : '#a19271';
            const size = this.setDimensionsPlusOffset(-borderWidth * 3);
            if (this.borderMode === 'coin') {
                return {
                    ...size,
                    ...this.setPositionAtCenter(),
                    fillLinearGradientColorStops: [
                        0,
                        LightenDarkenColor(color, 0.4),
                        0.5,
                        LightenDarkenColor(color, -0.2),
                        1,
                        LightenDarkenColor(color, -0.3),
                    ],
                    fillLinearGradientStartPoint: {
                        x: 0,
                        y: -this.tokenSize * 0.5,
                    },
                    fillLinearGradientEndPoint: {
                        x: 0,
                        y: this.tokenSize * 0.5,
                    },
                    fillEnabled: true,
                };
            }
            if (this.borderMode === 'tile') {
                return {
                    ...size,
                    ...this.setPositionAtCenter(),
                    ...setOffsetAtCenter(size),
                    fillLinearGradientColorStops: [
                        0,
                        LightenDarkenColor(color, 0.4),
                        0.49,
                        LightenDarkenColor(color, 0.4),
                        0.51,
                        LightenDarkenColor(color, -0.2),
                        1,
                        LightenDarkenColor(color, -0.2),
                    ],
                    fillLinearGradientStartPoint: {
                        x: this.tokenSize,
                        y: 0,
                    },
                    fillLinearGradientEndPoint: {
                        x: 0,
                        y: this.tokenSize,
                    },
                    fillEnabled: true,
                };
            }
            return {};
        },
        innerBGConfig: function() {
            const size = this.setDimensionsPlusOffset(-borderWidth * 4);
            if (this.borderMode === 'coin') {
                return {
                    ...size,
                    ...this.setPositionAtCenter(),
                    fill: '#353b3a',
                    fillEnabled: true,
                };
            }
            if (this.borderMode === 'tile') {
                return {
                    ...size,
                    ...this.setPositionAtCenter(),
                    ...setOffsetAtCenter(size),
                    fill: '#353b3a',
                    fillEnabled: true,
                };
            }
            return {};
        },
        totalImageMargin() {
            if (this.borderMode === 'coin') {
                return this.setDimensionsPlusOffset(-borderWidth * 4);
            }
            if (this.borderMode === 'circle') {
                return this.setDimensionsPlusOffset(0);
            }
            if (this.borderMode === 'tile') {
                return this.setDimensionsPlusOffset(-borderWidth * 4);
            }
            if (this.borderMode === 'square') {
                return this.setDimensionsPlusOffset(0);
            }
            return this.gridSize;
        },
        imageConfig: function() {
            let image = this.imageSizeCache ? this.imageSizeCache : { width: 100, height: 100 };
            const asset = new Image();
            asset.src = this.entity.image;

            const cell = this.totalImageMargin;
            const ratios = [image.width / image.height, image.height / image.width];
            let dimensions;
            if (ratios[0] > 1) {
                dimensions = {
                    width: cell.width,
                    height: cell.height * ratios[1],
                };
            } else {
                dimensions = {
                    width: cell.width * ratios[0],
                    height: cell.height,
                };
            }

            return {
                image: asset,
                ...dimensions,
                ...setOffsetAtCenter(dimensions),
                ...this.setPositionAtCenter(this.totalImageMargin),
            };
        },
        clipConfig: function() {
            if (this.borderMode === 'coin' || this.borderMode === 'circle') {
                const g = this.totalImageMargin;
                return {
                    ...setOffsetAtCenter(g),
                    ...this.setPositionAtCenter(),
                    clipFunc: function(ctx) {
                        ctx.arc(
                            g.width * 0.5,
                            g.height * 0.5,
                            Math.min(g.height, g.width) * 0.5,
                            0,
                            Math.PI * 2,
                            false,
                        );
                    },
                };
            }
            if (this.borderMode === 'tile' || this.borderMode === 'square') {
                const g = this.totalImageMargin;
                return {
                    ...setOffsetAtCenter(g),
                    ...this.setPositionAtCenter(),
                    clipFunc: function(ctx) {
                        ctx.rect(0, 0, g.width, g.height);
                    },
                };
            }
            return {};
        },
        shapeConfig() {
            return {
                type: 'v-circle',
                config: {
                    radius: Math.floor(this.tokenSize / 2) - 1,
                    stroke: '#0A0',
                    strokeOpacity: 0.3,
                    strokeEnabled: this.selected,
                },
            };
        },
        iconContainerConfig: function() {
            //adjust the offset for Square Tokens
            let squareMultiplier = this.iconCircleSize * (this.isSquare ? 0.25 : 1);
            return {
                ...this.setPositionAtCenter(),
                offsetX: -(this.tokenSize / 2) + squareMultiplier,
                offsetY: this.tokenSize / 2 - squareMultiplier,
            };
        },
        iconCircleSize: function() {
            return this.tokenSize / 6;
        },
        iconCircleConfig: function() {
            return {
                radius: this.iconCircleSize,
                fill: '#1c1c1c',
                stroke: this.entity.borderColor,
                strokeWidth: this.iconCircleSize * 0.2,
            };
        },
        iconTextConfig: function() {
            let size = this.iconCircleSize * 0.9;
            return {
                text: this.entity.icon,
                fontFamily: 'RPGAwesome',
                fill: '#fff',
                fontSize: size,
                offsetX: size * 0.5,
                offsetY: size * 0.5,
            };
        },
        isSquare() {
            return this.borderMode == 'tile' || this.borderMode == 'square';
        },
        isCenteredOnIntersection() {
            const size = this.entity.tokenSize;
            const isCenteredOnGridSquare = size == 1 || size % 2 == 0;
            return !isCenteredOnGridSquare;
        },
    },
    created: async function() {
        const image = await this.loadImage(this.entity.image);
        this.imageSizeCache = { width: image.width, height: image.height };
    },
    methods: {
        ...mapActions('assets', {
            loadImage: 'load',
        }),
        setDimensionsPlusOffset(offset) {
            const size = this.tokenSize + offset;
            return { width: size, height: size };
        },
        gridPosToPixels(gridPos, pixelsPerGrid) {
            const offset = this.isCenteredOnIntersection ? this.gridSize / 2 : 0;
            return {
                x: gridPos.q * pixelsPerGrid + offset,
                y: gridPos.r * pixelsPerGrid + offset,
            };
        },
        setPositionAtCenter({ width, height } = { width: this.gridSize, height: this.gridSize }) {
            return {
                x: width / 2,
                y: height / 2,
            };
        },
        getTokenPosition() {
            const position = this.$refs.group.getNode().position();
            if (this.isCenteredOnIntersection) {
                position.x -= this.gridSize / 2;
                position.y -= this.gridSize / 2;
            }
            return position;
        },
        onDragend() {
            this.$emit('moved', {
                position: this.$refs.group.getNode ? this.getTokenPosition() : { x: 0, y: 0 }, // getNode() returns null in tests
                entity: this.entity,
            });
        },
        onClick() {
            this.selected = !this.selected;
            if (this.selected) {
                this.$store.commit('tokens/updateSelectedToken', this.entity);
                this.$emit('selected', {
                    entity: this.entity,
                });
            } else {
                this.$store.commit('tokens/updateSelectedToken', {});
                this.$emit('deselected');
            }
        },
        onDoubleClick() {
            if (!this.selected) {
                this.selected = true;
                this.$emit('selected', {
                    entity: this.entity,
                });
            }
            this.$emit('dblclick', {
                character: this.entity,
            });
        },
    },
};
</script>
