<template>
    <v-group>
        <v-image
            ref="images"
            v-for="config in mapImages"
            :key="config.name"
            :config="config"
            @dragend="handleDragend"
            @click="handleStageMouseDown"
            @transformend="handleTransformEnd"
        />
        <v-transformer
            ref="transformer"
            :config="{
                anchorStroke: '#21A0A0',
                anchorFill: '#cfffff',
                anchorSize: 12,
                borderStroke: '#21A0A0',
                borderStrokeWidth: 2,
                borderDash: [6, 8],
                anchorCornerRadius: 6,
                anchorStrokeWidth: 1.6,
            }"
        />
    </v-group>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex';
import * as jsonpatch from 'fast-json-patch';
import _ from 'lodash';

import { COLLECTION_TYPES } from '@/core/collections/constants';
import { sceneEventBus } from '@/table/utils/sceneEventBus.js';

export default {
    props: {
        files: {
            type: Array,
            default: () => [],
        },
    },
    computed: {
        ...mapState('gamestate', {
            activeMap: 'activeMap',
        }),
        ...mapState('editingModes', {
            isEditing: 'editMap',
        }),
        mapImages() {
            return this.files.map(file => this.setImage(file));
        },
    },
    watch: {
        isEditing(active) {
            if (active) {
                sceneEventBus.$on('removeMapImages', this.removeMapImages);
                sceneEventBus.$on('moveMapImagesZIndex', this.moveMapImagesZIndex);
            } else {
                this.$refs.transformer
                    .getNode()
                    .nodes()
                    .forEach(this.updateTransformer);
                sceneEventBus.$off('removeMapImages');
                sceneEventBus.$off('moveMapImagesZIndex');
            }
        },
        mapImages: {
            // Updates the global state with the shapes of each map image
            // whenever map images are added, removed or modified
            async handler(mapImages) {
                // Wait for all images to load so that their dimensions are available
                const imagePromises = mapImages.map(
                    mapImage =>
                        new Promise(resolve => {
                            if (mapImage.image.complete) return resolve();
                            mapImage.image.addEventListener('load', () => resolve());
                        }),
                );
                await Promise.all(imagePromises);
                const compositeShapes = mapImages.map(config => ({
                    ..._.cloneDeep(_.omit(config, 'image')),
                    width: config.image.width,
                    height: config.image.height,
                }));
                this.setMapShapes(compositeShapes);
            },
            immediate: true,
            deep: true,
        },
    },
    beforeDestroy() {
        sceneEventBus.$off('removeMapImages');
        sceneEventBus.$off('moveMapImagesZIndex');
    },
    methods: {
        ...mapActions('collections', {
            updateMap: 'update',
        }),
        ...mapMutations('gamestate', {
            setMapShapes: 'setMapShapes',
        }),
        setImage(file) {
            let image = new Image();
            image.src = file.asset.src;
            image.onload = this.redrawLayer;
            const { pos } = file;
            return {
                image,
                name: file.id ?? 'background',
                x: pos.x ?? 0,
                y: pos.y ?? 0,
                rotation: pos.rotation ?? 0,
                scaleX: pos.scaleX ?? 1,
                scaleY: pos.scaleY ?? 1,
            };
        },
        redrawLayer() {
            this.$refs.transformer
                ?.getNode()
                .getLayer()
                .draw();
        },
        handleDragend(e) {
            const modifiedMap = _.cloneDeep(this.activeMap);
            const file = modifiedMap.stage.elements.find(file => file.id === e.target.name());
            file.pos.x = e.target.x();
            file.pos.y = e.target.y();
            const patch = jsonpatch.compare(this.activeMap, modifiedMap);
            this.sendUpdate(patch);
        },
        handleStageMouseDown(e) {
            if (this.isEditing) {
                this.updateTransformer(e.target.VueComponent.getNode());
            }
        },
        updateTransformer(toTransformNode) {
            const transformerNode = this.$refs.transformer.getNode();
            const index = transformerNode.nodes().indexOf(toTransformNode);
            const notFoundInArray = index < 0;

            if (notFoundInArray) {
                this.activateTransformStyle(toTransformNode);
                this.addNodeToTransformer(transformerNode, toTransformNode);
            } else {
                this.deactivateTransformStyle(toTransformNode);
                this.removeNodeFromTransformer(transformerNode, index);
            }
        },
        activateTransformStyle(node) {
            node.opacity(0.7);
            node.draggable(true);
            const stageContainer = node.getStage().container();
            stageContainer.style.cursor = 'move';
            node.on('mouseleave', () => (stageContainer.style.cursor = 'default'));
            node.on('mouseenter', () => (stageContainer.style.cursor = 'move'));
        },
        addNodeToTransformer(transformer, node) {
            const nodes = transformer.nodes().slice();
            nodes.push(node);
            transformer.nodes(nodes);
        },
        deactivateTransformStyle(node) {
            node.opacity(1);
            node.draggable(false);
            const stageContainer = node.getStage().container();
            node.off('mouseenter');
            node.off('mouseleave');
            stageContainer.style.cursor = 'default';
        },
        removeNodeFromTransformer(transformer, index) {
            const nodes = transformer.nodes().slice();
            nodes.splice(index, 1);
            transformer.nodes(nodes);
        },
        handleTransformEnd(e) {
            const modifiedMap = _.cloneDeep(this.activeMap);
            const file = modifiedMap.stage.elements.find(file => file.id === e.target.name());
            file.pos.x = e.target.x();
            file.pos.y = e.target.y();
            file.pos.rotation = e.target.rotation();
            file.pos.scaleX = e.target.scaleX();
            file.pos.scaleY = e.target.scaleY();
            const patch = jsonpatch.compare(this.activeMap, modifiedMap);
            this.sendUpdate(patch);
        },
        removeMapImages() {
            const transformingNodes = this.$refs.transformer.getNode().nodes();
            transformingNodes.forEach(this.updateTransformer);
            const modifiedMap = _.cloneDeep(this.activeMap);
            modifiedMap.stage.elements = transformingNodes.reduce(this.removeFromFiles, modifiedMap.stage.elements);
            const patch = jsonpatch.compare(this.activeMap, modifiedMap);
            this.sendUpdate(patch);
        },
        removeFromFiles(files, node) {
            const id = node.name();
            return files.filter(file => file.id !== id);
        },
        moveMapImagesZIndex(step) {
            const transformingNodes = this.$refs.transformer.getNode().nodes();
            const modifiedMap = _.cloneDeep(this.activeMap);
            modifiedMap.stage.elements.unshift({});
            modifiedMap.stage.elements.push({});
            let indexes = [];
            transformingNodes.forEach(node =>
                indexes.push(modifiedMap.stage.elements.findIndex(element => element.id === node.name())),
            );
            indexes.sort((int1, int2) => int2 * step + int1 * (step * -1));
            indexes.forEach(index => {
                const element = modifiedMap.stage.elements.splice(index, 1)[0];
                modifiedMap.stage.elements.splice(index + step, 0, element);
            });
            modifiedMap.stage.elements = modifiedMap.stage.elements.filter(element => !_.isEmpty(element));
            const patch = jsonpatch.compare(this.activeMap, modifiedMap);
            this.sendUpdate(patch);
        },
        moveFileZIndex(files, node) {
            const id = node.name();
            let index = files.reverse().findIndex(file => file.id === id);
            const file = files.splice(index, 1)[0];
            files.splice(index + 1, 0, file);
            return files;
        },
        sendUpdate(patch) {
            if (patch.length > 0) {
                this.updateMap({ collection: COLLECTION_TYPES.maps, id: this.activeMap._id, patch });
            }
        },
    },
};
</script>
