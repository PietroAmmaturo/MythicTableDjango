<template>
    <div
        ref="container"
        :style="containerStyle"
        @dragover="dragOver($event)"
        @drop="drop($event)"
        class="sceneContainer"
        @keyup.delete="triggerRemoveToken"
        tabindex="0"
    >
        <v-stage ref="stage" :config="stageConfig" @wheel="onWheelZoom($event)" @dragend.self="moveGridWithStage">
            <v-layer>
                <v-group ref="GridSpace" :config="gridConfig">
                    <v-group ref="MapSpace" v-if="activeMap">
                        <MapImage :files="activeMapImages" />
                        <GridFinderLayer
                            :mapId="activeMap ? activeMap._id : ''"
                            @gridFinderPos="updateGridFinderPos"
                            @changed="onGridFinderChange"
                        ></GridFinderLayer>
                    </v-group>
                    <v-group ref="GridSpace">
                        <GridLines ref="gridLines" :gridConfig="stage.grid" :stageScale="stageScale.x"></GridLines>
                        <TokenSpace ref="TokenSpace" :stage="stage" />
                    </v-group>
                    <DrawingLayer
                        v-on:drawingPos="updateDrawingPos"
                        :stageMouseEvents="stageMouseEvents"
                        :mapId="activeMap ? activeMap._id : ''"
                        isDrawing="isDrawing"
                    ></DrawingLayer>
                </v-group>
            </v-layer>
            <unleash-feature name="fog-of-war">
                <FogLayer :stageMouseEvents="stageMouseEvents" />
            </unleash-feature>
        </v-stage>
        <CharacterEditorWindow />
        <MapEditorWindow
            ref="mapEditor"
            @onChange="onMapSaved"
            @onAdd="onMapAdded"
            @onCancel="showMapEditor = false"
            @onDelete="onMapDeleted"
            v-show="showMapEditor"
        />
        <MapEditingMode v-if="isEditingMap" @addMaps="updateServerWithMapElements" />
        <ProfileEditor />
        <CampaignEditWindow />
        <GmControlsWindow />
        <ErrorDialog />
        <Debugger v-if="false" :debugMessage="debugMessage" />
    </div>
</template>

<script>
import Vue from 'vue';
import VueKonva from 'vue-konva';
import Konva from 'konva';
import { mapGetters, mapState, mapMutations, mapActions } from 'vuex';
import * as jsonpatch from 'fast-json-patch';
import _ from 'lodash';

import { findGrid } from 'gridfinder';
import { addMap } from '@/core/api/files/files.js';

import SquareGrid from '@/core/grid/SquareGrid.js';
import GridLines from './GridLines.vue';
import TokenSpace from './token-space/TokenSpace.vue';
import MapImage from './MapImage.vue';
import MapEditingMode from './MapEditingMode.vue';
import ProfileEditor from '@/profile/components/ProfileEditor.vue';
import CampaignEditModal from '@/campaigns/components/CampaignEditModal.vue';
import GmControlsModal from '@/campaigns/components/GmControlsModal.vue';
import DrawingLayer from './DrawingLayer.vue';
import GridFinderLayer from './GridFinderLayer.vue';
import FogLayer from '@/core/fog/components/FogLayer.vue';
import CharacterEditor from '@/characters/components/character-editor/CharacterEditor.vue';
import ErrorDialog from '@/common/components/ErrorDialog.vue';
import Debugger from './Debugger.vue';

import { MAP } from '@/maps/constants.js';
import MapEditorWindow from '@/maps/components/EditorWindow';

import { COLLECTION_TYPES } from '@/core/collections/constants';
import { createGUID } from '@/table/utils/guid.js';

import MapModel from '@/maps/map_model.js';
import { defaultElement } from '@/maps/map_model.js';

Vue.use(VueKonva);

export default {
    components: {
        CharacterEditorWindow: CharacterEditor,
        CampaignEditWindow: CampaignEditModal,
        GmControlsWindow: GmControlsModal,
        ErrorDialog,
        GridLines,
        TokenSpace,
        MapImage,
        MapEditingMode,
        DrawingLayer,
        GridFinderLayer,
        FogLayer,
        ProfileEditor,
        MapEditorWindow,
        Debugger,
    },
    data() {
        return {
            DEFAULT_PIXELS_PER_GRID: 50,
            gridConfig: {
                scale: {
                    x: 1,
                    y: 1,
                },
                position: {
                    x: 0,
                    y: 0,
                },
                visible: true,
            },
            renderContext: {
                gridSpace: null,
                pixelRatio: 1,
            },
            viewport: {
                size: { width: null, height: null },
            },
            drawingConfig: {
                isPaint: false,
                mode: 'brush',
                lastLine: null,
            },
            showMapEditor: false,
            stageMouseEvents: new EventTarget(),
            stageScale: { x: 1, y: 1 },
            stagePos: {},
            drawingPos: {},
            gridFinderPos: {},
        };
    },
    computed: {
        ...mapState('gamestate', {
            activeMap: 'activeMap',
        }),
        ...mapState('drawing', {
            isDrawing: 'active',
        }),
        ...mapState('fog', {
            isEditingFog: 'active',
        }),
        ...mapState('live', {
            connected: 'connected',
        }),
        ...mapState('editingModes', {
            isEditingMap: 'editMap',
        }),
        ...mapState('unleash', {
            enabledFeatures: 'enabledFeatures',
        }),
        ...mapGetters('collections', {
            getItem: 'getItem',
            maps: 'maps',
        }),
        ...mapGetters('window', {
            isDisplayingModal: 'isDisplayingModal',
        }),
        containerStyle() {
            return {
                'background-color': this.stage.color || '#121212',
            };
        },
        stageConfig: function() {
            return {
                draggable: this.isStageDraggable,
                size: this.viewport.size,
                scale: this.stageScale,
            };
        },
        isStageDraggable() {
            return this.isDrawing || this.isEditingFog ? false : true;
        },
        stage: function() {
            return this.activeMap ? this.activeMap.stage : getDefaultStage();
        },
        gridCount: function() {
            const { q, r } = this.stage.bounds.se;
            return { width: q + 1, height: r + 1 };
        },
        activeMapImages() {
            if (!this.activeMap) {
                return [];
            }
            return this.activeMap.stage.elements;
        },
        debugMessage() {
            const { gridConfig, stagePos, drawingPos, gridFinderPos } = this;
            return {
                'Grid Configuration': gridConfig,
                'Cursor Position': stagePos,
                'Drawing Position': drawingPos,
                'Grid Finder Position (Activate gridFinder to engage)': gridFinderPos,
            };
        },
        isLocalHost() {
            const hostname = window.location.hostname;
            return hostname === 'localhost';
        },
    },
    watch: {
        'stage.grid': {
            handler({ type, size }) {
                if (type !== 'square') {
                    if (process.env.NODE_ENV !== 'production') {
                        console.warn('Only square grids are currently supported');
                    }
                    type = 'square';
                }
                size = MAP.MAGIC_SCALE;
                let gridSpace = this.renderContext.gridSpace;
                this.renderContext.gridSpace =
                    gridSpace && gridSpace.type === type ? gridSpace.withSize(size) : new SquareGrid(size);
            },
            deep: true,
            immediate: true,
        },
        connected: async function() {
            if (this.connected) {
                await this.loadTokens();
                await this.loadGmPermissions();
            }
        },
        activeMap() {
            if (this.activeMap) {
                // let frame = {
                //     n: 0,
                //     w: 0,
                //     s: this.activeMap.stage.bounds.se.r + 1,
                //     e: this.activeMap.stage.bounds.se.q + 1,
                // };
                // if (this.activeMap.hasOwnProperty('start')) {
                //     frame = this.activeMap.start;
                // }
                // const gridSpace = this.renderContext.gridSpace;
                // const position = gridSpace.gridToStage({ q: -frame.w, r: -frame.n, pa: 'nw' });
                // const desiredGridHeight = this.viewport.size.height / (frame.s - frame.n);
                // const desiredGridWidth = this.viewport.size.width / (frame.e - frame.w);
                // const finalGridSize = Math.min(desiredGridHeight, desiredGridWidth);
                // this.renderContext.gridColor = this.activeMap.stage.grid.color;
                // this.renderContext.gridFullness = this.activeMap.stage.grid.lineFullness;
                // const stage = this.$refs.stage.getNode();
                // stage.position(position);
                // this.renderContext.gridSpace = gridSpace.withSize(finalGridSize);
            }
        },
        receivedLines: {
            handler(lines) {
                // Filter list to lines that don't already exist
                let existingIds = this.$refs.drawingcanvas
                    .getNode()
                    .getLayer()
                    .getChildren()
                    .map(shape => shape.id);
                lines
                    .filter(line => !existingIds.includes(line.id))
                    .forEach(line => {
                        this.$refs.drawingcanvas
                            .getNode()
                            .getLayer()
                            .add(Konva.Node.create(line));
                    });
                this.$refs.drawingcanvas
                    .getNode()
                    .getLayer()
                    .batchDraw();
            },
        },
    },
    created() {
        this.renderContext.pixelRatio = window.devicePixelRatio || 1;
    },
    mounted() {
        this.addMouseEvents();
    },
    methods: {
        ...mapActions('tokens', {
            loadTokens: 'load',
        }),
        ...mapActions('gmPermissions', {
            loadGmPermissions: 'loadGmPermissions',
        }),
        ...mapActions('errors', {
            showError: 'modal',
        }),
        emitMouseMove(sPos) {
            const offset = this.viewport.pos;
            const stagePos = {
                x: sPos.x + offset.x,
                y: sPos.y + offset.y,
            };
            this.$emit('mousemove', {
                stage: stagePos,
                grid: this.renderContext.gridSpace.stageToGrid(stagePos),
            });
        },
        //Map
        ...mapActions('collections', {
            loadMaps: 'loadMaps',
            updateMap: 'update',
            addMap: 'add',
            removeMap: 'remove',
        }),
        ...mapMutations('editingModes', {
            setEditMap: 'setEditMap',
            setHiddenSidebar: 'setHiddenSidebar',
        }),
        async onMapAdded({ map }) {
            this.showMapEditor = false;
            this.$store.dispatch('analytics/pushEvent', {
                event: { category: 'CampaignMap', action: 'AddMap', name: map.name, value: map._id },
            });
            await this.addMap({ collection: COLLECTION_TYPES.maps, item: map });
            this.prepareToEditMap();
        },
        prepareToEditMap() {
            this.setEditMap(true);
            this.setHiddenSidebar(true);
        },
        onMapSaved({ id, patch }) {
            this.showMapEditor = false;
            this.updateMap({ collection: COLLECTION_TYPES.maps, id, patch });
        },
        onMapDeleted({ mapId }) {
            this.showMapEditor = false;
            this.removeMap({ collection: COLLECTION_TYPES.maps, id: mapId });
        },
        onMapAdd: function() {
            this.showMapEditor = true;
            const map = MapModel;
            this.$refs.mapEditor.saveButton = 'Add';
            this.$refs.mapEditor.showDelete = false;
            this.$refs.mapEditor.map = map;
        },

        onMapEdit: function({ map }) {
            this.showMapEditor = true;
            this.$refs.mapEditor.saveButton = 'Save';
            this.$refs.mapEditor.showDelete = true;
            this.$refs.mapEditor.map = map;
        },
        triggerRemoveToken() {
            if (!this.isDisplayingModal) {
                this.$refs.TokenSpace.onDelete();
            }
        },
        fitToContainer() {
            const container = this.$refs.container;
            const rect = container.getClientRects()[0];
            this.viewport.size = {
                height: Math.floor(rect.height),
                width: Math.floor(rect.width),
            };
        },
        onWheelZoom(event) {
            event.evt.preventDefault();

            // If no change, don't do anything.
            if (event.evt.deltaY === 0) {
                return;
            }

            // DOM manipulation to reference Konva Stage.
            const stage = event.currentTarget;
            // Record previous scale.
            const oldScale = stage.scaleX();
            // Get pointer postion from Stage.
            const pointer = stage.getPointerPosition();
            // Set the relative relationship to the pointer from zoom.
            const mousePointTo = {
                x: (pointer.x - stage.x()) / oldScale,
                y: (pointer.y - stage.y()) / oldScale,
            };

            // How fast the user will zoom in or out.
            const scaleBy = 1.05;
            // Zooming in and out based off of event input
            let newScale = event.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
            newScale = +newScale.toFixed(3);
            // Set maximum and minumum zoom. Technically not required. Large for zoom-in, small for zoom-out.
            const { maxZoom, minZoom } = this.zoomCaps(stage);
            newScale = Math.min(maxZoom, Math.max(newScale, minZoom));

            // Only change if scale changed (min and max caps)
            if (newScale !== oldScale) {
                // Set Stage scale.
                this.stageScale = { x: newScale, y: newScale };
                // Where pointer should be in relation to newScale
                const newPos = {
                    x: pointer.x - mousePointTo.x * newScale,
                    y: pointer.y - mousePointTo.y * newScale,
                };
                // Position Stage using where mouse should be coordinates
                stage.position(newPos);

                this.moveGridWithStage();

                // Redraw/update Stage for user.
                stage.batchDraw();
            }
        },

        zoomCaps(stage) {
            const size = this.stage.grid.size;

            const minumumGridTilesOnScreen = 3;
            const maxZoomHeight = stage.height() / (size * minumumGridTilesOnScreen);
            const maxZoomWidth = stage.width() / (size * minumumGridTilesOnScreen);

            const maximumGridTilesOnScreen = 50;
            const minZoomWidth = stage.width() / (size * maximumGridTilesOnScreen);
            const minZoomHeight = stage.height() / (size * maximumGridTilesOnScreen);

            return { maxZoom: Math.max(maxZoomHeight, maxZoomWidth), minZoom: Math.min(minZoomHeight, minZoomWidth) };
        },

        dragOver(e) {
            e.preventDefault();
        },

        async drop(e) {
            e.preventDefault();
            if (this.$store.getters['dropper/ready']) {
                const pos = this.findRelativePointerPosition(e);
                const coordinateByGrid = { q: 0, r: 0 };
                coordinateByGrid.q = Math.round(pos.x / this.stage.grid.size) - 1;
                coordinateByGrid.r = Math.round(pos.y / this.stage.grid.size) - 1;

                const character = this.$store.getters['dropper/draggedItem'];
                this.$store.dispatch('analytics/pushEvent', {
                    event: {
                        category: 'CampaignMap',
                        action: 'AddCharacterToMap',
                        name: character.name,
                        value: character.id,
                    },
                });

                this.$store.dispatch('tokens/spawn', {
                    ...character,
                    pos: coordinateByGrid,
                    mapId: this.activeMap ? this.activeMap._id : null,
                });
                this.$store.dispatch('dropper/reset');
            } else {
                if (this.isEditingMap) {
                    this.$refs.container.style.cursor = 'wait';
                    await this.addMapImages(e);
                    this.$refs.container.style.cursor = 'default';
                }
            }
        },
        async addMapImages(event) {
            const files = this.onlyImageFiles(event?.dataTransfer.items ?? []);
            if (files.length > 0) {
                try {
                    const serverResponse = await addMap(files);
                    this.updateServerWithMapElements({ files: serverResponse.data.files, event: event });
                } catch (err) {
                    this.showError(err);
                }
            }
        },
        onlyImageFiles(dataItems) {
            return _.reduce(
                dataItems,
                (files, item) => {
                    const file = item.getAsFile();
                    const suportedFileTypes = /image\/(gif|jpe?g|png|webp|svg|bmp)/;
                    if (suportedFileTypes.test(file.type)) {
                        files.push(file);
                    } else {
                        this.showError(new Error(`File type not currently supported (${file.type}).`));
                        console.warn(`File type not currently supported (${file.type}).`);
                    }
                    return files;
                },
                [],
            );
        },
        updateServerWithMapElements({ files, event }) {
            const patch = this.prepareNewMapElements(files, event);
            if (patch.length > 0) {
                const id = this.activeMap._id;
                this.updateMap({ collection: COLLECTION_TYPES.maps, id, patch });
            }
        },
        prepareNewMapElements(files, event) {
            const modifiedMap = _.cloneDeep(this.activeMap);
            const pos = this.findRelativePointerPosition(event);
            files.forEach(file => {
                const element = _.cloneDeep(defaultElement);
                element.id = createGUID();
                element.asset.src = file.url;
                Object.assign(element.pos, pos);
                modifiedMap.stage.elements.push(element);
            });
            return jsonpatch.compare(this.activeMap, modifiedMap);
        },
        findRelativePointerPosition(event) {
            const node = this.$refs.GridSpace?.getNode();
            const transform = node?.getAbsoluteTransform().copy();
            transform?.invert();
            node?.getStage().setPointersPositions(event);
            const pointerPosition = node?.getStage().getPointerPosition();
            return transform?.point(pointerPosition) ?? { x: 0, y: 0 };
        },
        async onGridFinderChange(circles) {
            if (circles.length < 2) {
                return;
            }
            let results = null;
            try {
                results = findGrid(circles);
                const modifiedMap = _.cloneDeep(this.activeMap);
                await this.changeGridSize(modifiedMap, results.cellSize.width);
                const { x, y } = results.offset;
                modifiedMap.stage.grid.offset = { x: +x.toFixed(3), y: +y.toFixed(3) };
                const patch = jsonpatch.compare(this.activeMap, modifiedMap);
                this.onMapSaved({ id: this.activeMap._id, patch });
            } catch (err) {
                console.warn(`There was an error configuring the grid.\n${JSON.stringify(circles, null, 4)}`);
                console.warn(err);
            }
        },
        async changeGridSize(modifiedMap, newSize) {
            modifiedMap.stage.grid.size = +newSize.toFixed(3);
        },
        addMouseEvents() {
            // Attach up stage mouse events to the event bus
            ['mouseup', 'mousemove', 'mousedown'].forEach(eventName => {
                this.$refs.stage.getNode().on(eventName, ({ evt }) => {
                    this.stageMouseEvents.dispatchEvent(new MouseEvent(evt.type, evt));
                });
            });
            this.$refs.stage.getNode().on('mousemove', e => {
                const { screenX, screenY, clientX, clientY, layerX, layerY } = e.evt;
                const positionData = {
                    screen: {
                        x: screenX,
                        y: screenY,
                    },
                    client: {
                        x: clientX,
                        y: clientY,
                    },
                    layer: {
                        x: layerX,
                        y: layerY,
                    },
                };
                this.updateStagePosition(positionData);
            });
        },
        updateStagePosition(position) {
            this.stagePos = position;
        },
        updateDrawingPos(position) {
            this.drawingPos = position;
        },
        updateGridFinderPos(position) {
            this.gridFinderPos = position;
        },
        moveGridWithStage() {
            this.$refs.gridLines?.relativeStagePosition();
        },
    },
};

const getDefaultStage = () => {
    return {
        bounds: { nw: { q: 0, r: 0 }, se: { q: 49, r: 49 } },
        color: '#121212',
        grid: {
            type: 'square',
            size: 50,
            offset: { x: 0, y: 0 },
            visible: true,
        },
    };
};
</script>

<style>
.sceneContainer {
    height: 100%;
    width: 100%;
    flex: 1 1 auto;
}
</style>
