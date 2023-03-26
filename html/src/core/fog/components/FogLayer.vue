<template>
    <v-layer ref="fog">
        <v-group>
            <component
                v-for="(shape, index) in fogOfWar"
                :is="shape.konvaComponent"
                :key="index"
                :config="
                    hasPermissionFor('fogControl') && shape.config.globalCompositeOperation === 'source-over'
                        ? ownerConfig(shape.config)
                        : shape.config
                "
            />
            <component
                v-if="isUserVisualization"
                id="user-visualization"
                :is="userVisualization.konvaComponent"
                :config="userVisualization.config"
            />
        </v-group>
    </v-layer>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import _ from 'lodash';
import * as jsonpatch from 'fast-json-patch';

import { COLLECTION_TYPES } from '@/core/collections/constants.js';

export default {
    props: {
        stageMouseEvents: {
            type: EventTarget,
            required: true,
        },
    },
    data() {
        return {
            userVisualization: {},
            origin: { x: 0, y: 0 },
            activeKonvaComponent: 'v-rect',
        };
    },
    computed: {
        ...mapState('fog', {
            isEditing: 'active',
            isObscuring: 'obscure',
        }),
        ...mapState('gamestate', {
            activeMap: 'activeMap',
        }),
        ...mapGetters('hasPermission', {
            hasPermissionFor: 'hasPermissionFor',
        }),
        compositeOperation() {
            return this.isObscuring ? 'source-over' : 'destination-out';
        },
        outlineColor() {
            return this.isObscuring ? '#a700f2' : '#f2e400';
        },
        fillColor() {
            return this.isObscuring ? '#4f187c5e' : '#f2e4001a';
        },
        fogOfWar: {
            get() {
                if (!(this.activeMap && 'fog' in this.activeMap.stage && 'shapes' in this.activeMap.stage.fog)) {
                    return [];
                } else {
                    return this.activeMap.stage.fog.shapes;
                }
            },
            set(shape) {
                const clonedMap = _.cloneDeep(this.activeMap);
                if (!('fog' in clonedMap.stage)) {
                    clonedMap.stage.fog = {
                        shapes: [],
                    };
                } else if (!('shapes' in this.activeMap.stage.fog)) {
                    clonedMap.stage.fog.shapes = [];
                }
                clonedMap.stage.fog.shapes.push(shape);
                const patch = jsonpatch.compare(this.activeMap, clonedMap);
                if (patch.length) {
                    this.updateMap({ collection: COLLECTION_TYPES.maps, id: this.activeMap._id, patch: patch });
                }
            },
        },
        isUserVisualization() {
            return this.hasContent(this.userVisualization);
        },
    },
    watch: {
        isEditing(isEditing) {
            if (isEditing) {
                this.stageMouseEvents.addEventListener('mousedown', this.onMouseDown);
                this.stageMouseEvents.addEventListener('mouseup', this.onMouseUp);
            } else {
                this.stageMouseEvents.removeEventListener('mousedown', this.onMouseDown);
                this.stageMouseEvents.removeEventListener('mouseup', this.onMouseUp);
            }
        },
    },
    methods: {
        ...mapActions('collections', {
            updateMap: 'update',
        }),
        onMouseDown() {
            const mousePosition = this.getRelativePointerPosition(this.$refs.fog.getNode());
            this.setOrigin(mousePosition);
            const shape = this.calculateShape(mousePosition, mousePosition);
            this.userVisualization = this.applyUserVisualization(shape);
            this.stageMouseEvents.addEventListener('mousemove', this.onMouseMove);
        },
        onMouseMove() {
            const shape = this.recalculateShape(this.origin);
            this.userVisualization = this.applyUserVisualization(shape);
        },
        onMouseUp() {
            this.stageMouseEvents.removeEventListener('mousemove', this.onMouseMove);
            const shape = this.recalculateShape(this.origin);
            shape.config.fill = '#000';
            shape.config.globalCompositeOperation = this.compositeOperation;
            this.fogOfWar = shape;
            this.userVisualization = {};
        },
        hasContent(object) {
            return !_.isEmpty(object);
        },
        getRelativePointerPosition(node) {
            const transform = node.getAbsoluteTransform().copy();
            transform.invert();
            const pointerPosition = node.getStage().getPointerPosition();
            return transform.point(pointerPosition);
        },
        setOrigin(originPoint) {
            this.origin = originPoint;
        },
        calculateShape(referencePoint, currentPoint) {
            const konvaComponentConfigs = {
                'v-rect': this.rectangleConfig(referencePoint, currentPoint),
            };

            return {
                konvaComponent: this.activeKonvaComponent,
                config: konvaComponentConfigs[this.activeKonvaComponent],
            };
        },
        recalculateShape(referencePoint) {
            const newPoint = this.getRelativePointerPosition(this.$refs.fog.getNode());
            return this.calculateShape(referencePoint, newPoint);
        },
        rectangleConfig(origin, current) {
            return {
                fill: '#000',
                x: Math.min(origin.x, current.x),
                y: Math.min(origin.y, current.y),
                width: Math.max(current.x - origin.x, origin.x - current.x),
                height: Math.max(current.y - origin.y, origin.y - current.y),
                listening: false,
            };
        },
        applyUserVisualization(shape) {
            shape.config.fill = this.fillColor;
            shape.config.stroke = this.outlineColor;
            shape.config.strokeWidth = 3;
            return shape;
        },
        ownerConfig(config) {
            const clonedConfig = _.cloneDeep(config);
            clonedConfig.globalCompositeOperation = 'xor';
            clonedConfig.opacity = 0.5;
            return clonedConfig;
        },
    },
};
</script>
