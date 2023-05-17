<template>
    <v-group ref="drawing">
        <v-group v-for="(shapes, drawer) in shapeConfigs" :id="drawer" :key="drawer">
            <v-line v-for="shape in shapes" :key="shape.id" :config="shape"></v-line>
        </v-group>
    </v-group>
</template>

<script>
import { mapState } from 'vuex';
import Konva from 'konva';

export default {
    props: {
        stageMouseEvents: {
            type: EventTarget,
            required: true,
        },
        mapId: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            drawingConfig: {
                isPaint: false,
                mode: 'brush',
                lastLine: null,
            },
        };
    },
    computed: {
        ...mapState('drawing', {
            isDrawing: 'active',
            receivedLines: 'receivedLines',
            drawerLastActive: 'drawerLastActive',
            drawingColor: 'activeColor',
            brushSize: 'activeBrushSize',
        }),
        ...mapState('profile', {
            me: 'me',
        }),
        ...mapState('analytics', {}),
        shapeDrawers: function() {
            return Object.keys(this.receivedLines);
        },
        shapeConfigs: function() {
            if (!this.receivedLines) {
                return [];
            }

            let configs = {};

            for (let drawer of Object.keys(this.receivedLines)) {
                configs[drawer] = [];
                for (let shape of this.receivedLines[drawer]) {
                    let config = {
                        ...shape.attrs,
                    };
                    configs[drawer].push(config);
                }
            }

            return configs;
        },
    },
    updated() {},
    mounted() {
        this.stageMouseEvents.addEventListener('mousedown', e => this.onDrawingStart(e));
        this.stageMouseEvents.addEventListener('mousemove', e => {
            this.onDrawingMove(e);
            this.$emit('drawingPos', this.getRelativePointerPosition(this.$refs.drawing.getNode()));
        });
        this.stageMouseEvents.addEventListener('mouseup', e => this.onDrawingEnd(e));
        this.drawingDelayIntervalId = window.setInterval(() => {
            for (let userId of Object.keys(this.drawerLastActive)) {
                let drawingAge = Date.now() - this.drawerLastActive[userId];
                if (drawingAge > 4000) {
                    this.$store.dispatch('drawing/fadeUsersLines', { userId });
                    this.$refs.drawing
                        .getNode()
                        .getChildren(group => group.attrs.id === userId)
                        .forEach(group => {
                            let groupTween = new Konva.Tween({
                                node: group,
                                duration: 0.75,
                                opacity: 0,
                                onFinish: () => {
                                    this.$store.dispatch('drawing/purgeUsersLines', { userId });
                                    groupTween.destroy();
                                },
                            });
                            groupTween.play();
                        });
                }
            }
        }, 100);
    },
    beforeDestroy() {
        window.clearInterval(this.drawingDelayIntervalId);
    },
    methods: {
        getRelativePointerPosition(node) {
            // Layer = the layer element established in Scene.vue, holds all Scene elements
            // Layer corresponds to the window size MT has available.
            // node CANNOT be the Stage (parent of all Scene canvas elements)

            // Create a reference to Layer/window of this group
            const transform = node.getAbsoluteTransform().copy();

            // Transform the reference to become RELATIVE to Layer and this group
            transform.invert();

            // Get the pointer position relative to the Layer
            const pointerPosition = node.getStage().getPointerPosition();

            // Transform the Layer/window position to the RELATIVE position
            return transform.point(pointerPosition);
        },
        onDrawingStart() {
            if (!this.isDrawing) {
                return;
            }
            if (this.drawingConfig.lastLine) {
                // Drawing already in progress - perhaps dragged over another element
                // Just skip starting a new line and finish up this one
                return;
            }

            this.drawingConfig.isPaint = true;
            var pos = this.getRelativePointerPosition(this.$refs.drawing.getNode());
            this.drawingConfig.lastLine = new Konva.Line({
                stroke: this.drawingColor,
                strokeWidth: this.brushSize,
                globalCompositeOperation: this.drawingConfig.mode === 'brush' ? 'source-over' : 'destination-out',
                points: [pos.x, pos.y],
                name: this.me.id,
            });
            this.$refs.drawing.getNode().add(this.drawingConfig.lastLine);
        },
        onDrawingEnd() {
            if (!this.drawingConfig.isPaint) {
                return;
            }
            this.drawingConfig.isPaint = false;
            if (!this.drawingConfig.lastLine) {
                return;
            }

            this.$store.dispatch('drawing/drawLine', {
                mapId: this.mapId,
                line: this.drawingConfig.lastLine.toObject(),
            });
            this.drawingConfig.lastLine.destroy();
            this.drawingConfig.lastLine = null;
            this.$store.dispatch('analytics/pushEvent', {
                event: { category: 'CampaignMap', action: 'Draw' },
            });
        },
        onDrawingMove() {
            if (!this.drawingConfig.isPaint) {
                return;
            }
            const pos = this.getRelativePointerPosition(this.$refs.drawing.getNode());
            var newPoints = this.drawingConfig.lastLine.points().concat([pos.x, pos.y]);
            this.drawingConfig.lastLine.points(newPoints);
            this.$refs.drawing
                .getNode()
                .getLayer()
                .batchDraw();
        },
    },
};
</script>
