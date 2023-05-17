<template>
    <div style="height: 100vh; width: 100vw">
        <Scene ref="scene" @onDraw="drawEvent"></Scene>
        <Header />
        <Sidebar>
            <Window>
                <template v-slot:header>Chat</template>
                <Chat />
            </Window>
            <Window ref="mapWindow" v-bind:collapse-on-click="false">
                <template v-slot:header>
                    <div class="map-header">
                        <div @click="collapseWindow($refs.mapWindow)">
                            Maps
                        </div>
                        <svg
                            viewBox="0 0 16 16"
                            class="bi bi-plus"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                            @click="mapAddClick"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M8 3.5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5H4a.5.5 0 0 1 0-1h3.5V4a.5.5 0 0 1 .5-.5z"
                            />
                            <path
                                fill-rule="evenodd"
                                d="M7.5 8a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1H8.5V12a.5.5 0 0 1-1 0V8z"
                            />
                        </svg>
                    </div>
                </template>
                <Maps ref="mapCollection" @onEdit="mapEditTrigger" />
            </Window>
            <Window ref="characterWindow" v-bind:collapse-on-click="false">
                <template v-slot:header>
                    <div class="map-header">
                        <div @click="collapseWindow($refs.characterWindow)">
                            Character
                        </div>
                        <svg
                            viewBox="0 0 16 16"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                            @click="addCharacter"
                            v-tooltip="addCharacterTooltip"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M8 3.5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5H4a.5.5 0 0 1 0-1h3.5V4a.5.5 0 0 1 .5-.5z"
                            />
                            <path
                                fill-rule="evenodd"
                                d="M7.5 8a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1H8.5V12a.5.5 0 0 1-1 0V8z"
                            />
                        </svg>
                        <svg
                            viewBox="0 0 16 16"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                            @click="$refs.uploader.click()"
                            v-tooltip="addCharactersTooltip"
                        >
                            <path
                                class="st0"
                                d="M8,3.5c0.3,0,0.5,0.2,0.5,0.5v4c0,0.3-0.2,0.5-0.5,0.5H4C3.7,8.5,3.5,8.3,3.5,8c0-0.3,0.2-0.5,0.5-0.5h3.5V4
                                C7.5,3.7,7.7,3.5,8,3.5z"
                            />
                            <path
                                class="st0"
                                d="M7.5,8c0-0.3,0.2-0.5,0.5-0.5h4c0.3,0,0.5,0.2,0.5,0.5c0,0.3-0.2,0.5-0.5,0.5H8.5V12c0,0.3-0.2,0.5-0.5,0.5
                                c-0.3,0-0.5-0.2-0.5-0.5V8z"
                            />
                            <circle cx="9.5" cy="12" r="0.5" />
                            <circle cx="10.6" cy="12" r="0.5" />
                            <circle cx="11.8" cy="12" r="0.5" />
                        </svg>
                    </div>
                    <input
                        ref="uploader"
                        style="display: none;"
                        type="file"
                        :name="addCharacter"
                        @change="addCharacters"
                        accept="image/*"
                        multiple
                    />
                </template>
                <Character />
            </Window>
        </Sidebar>
        <MacroBar />
    </div>
</template>

<script>
import Vue from 'vue';
import VueKonva from 'vue-konva';
import { mapState, mapActions } from 'vuex';

import Header from '@/table/components/play-view/Header/Header.vue';

import LivePlayDirector from '@/core/live/ChannelsLivePlayDirector';
import Scene from '@/table/components/scene/Scene.vue';

import Maps from '@/maps/components/Maps';
import Characters from '@/characters/components/character-library/CharacterLibrary.vue';

import Chat from '@/chat/components/Chat.vue';
import Window from '@/table/components/play-view/Sidebar/Window.vue';

import Sidebar from '@/table/components/play-view/Sidebar/Sidebar.vue';
import Character from '@/characters/models/model';
import MacroBar from '@/characters/components/macro-bar/MacroBar.vue';

Vue.use(VueKonva);

export default {
    components: {
        Scene: Scene,
        Header: Header,
        Maps: Maps,
        Chat: Chat,
        Window: Window,
        Sidebar: Sidebar,
        Character: Characters,
        MacroBar,
    },
    props: {
        sessionId: {
            type: String,
            default: '',
        },
        mapId: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            hiddenSidebar: false,
            addCharacterTooltip: {
                content: 'Add Character',
                offset: '3px',
                hideOnTargetClick: false,
            },
            addCharactersTooltip: {
                content: 'Add Multiple Characters',
                offset: '3px',
                hideOnTargetClick: false,
            },
        };
    },
    computed: {
        ...mapState('drawing', {
            drawnStrokes: 'drawnStrokes',
        }),
        ...mapState('window', {
            windowSize: 'windowSize',
        }),
    },
    provide: function() {
        return {
            director: this.director,
        };
    },
    watch: {
        mapId: {
            handler() {
                this.loadMap({
                    sessionId: this.sessionId,
                    mapId: this.mapId,
                });
            },
            deep: true,
        },
        drawnStrokes: {
            handler(strokes) {
                this.director.drawStrokes(this.mapId, strokes);
            },
        },
        windowSize: {
            handler() {
                this.fitMapToWindow();
            },
            deep: true,
        },
    },
    beforeRouteEnter(to, from, next) {
        try {
            next(async vm => {
                await vm.me();
            });
        } catch (error) {
            next(vm => vm.setError(error));
        }
    },
    beforeCreate() {
        this.director = new LivePlayDirector(this.$store, this.$router);
        this.director.init();
    },
    created() {
        this.director.sessionId = this.sessionId;
        this.director.connect();
        // Reset campaign-specific state
        this.$store.dispatch('collections/reload');
        this.$store.dispatch('gamestate/activateMap', null);
        this.$store.dispatch('campaigns/getActiveCampaign', this.sessionId);
        this.$store.dispatch('keyboard/addTracking');
        this.$store.dispatch('window/addTracking');
        this.resetMap();
    },
    mounted() {
        this.$nextTick(() => {
            this.fitMapToWindow();
        });
    },
    async beforeDestroy() {
        this.$store.dispatch('gamestate/clear');
        this.$store.dispatch('keyboard/removeTracking');
        this.$store.dispatch('window/removeTracking');
        await this.director.disconnect();
    },
    methods: {
        ...mapActions('errors', {
            showError: 'modal',
        }),
        ...mapActions('profile', {
            me: 'me',
        }),
        ...mapActions('library', {
            addCharacterFile: 'addCharacter',
        }),
        ...mapActions('characters', {
            addCharacterCollection: 'add',
            openCharacterEditor: 'openEditor',
        }),
        async resetMap() {
            this.$store.dispatch('drawing/clearLines');
        },
        setError() {
            // TODO Display error message if unable to load profile data
            console.err('Unable to load profile data');
        },
        fitMapToWindow() {
            this.$refs.scene.fitToContainer();
        },
        onMapChanged({ mapId, patch }) {
            this.director.updateMap(mapId, patch);
        },
        drawEvent({ strokes }) {
            this.director.drawStrokes(this.mapId, strokes);
        },
        mapAddClick() {
            this.$refs.scene.onMapAdd();
        },
        collapseWindow(ref) {
            ref.collapseWindow = !ref.collapseWindow;
        },
        addCharacter() {
            this.openCharacterEditor(this.createCharacter());
        },
        async addCharacters(parameters) {
            if (!parameters) {
                return;
            }
            try {
                const results = await this.addCharacterFile(parameters);
                results.data.files.forEach(async file => {
                    this.$store.dispatch('analytics/pushEvent', {
                        event: { category: 'CampaignMap', action: 'AddCharacterToLibrary', name: file.url },
                    });
                    const character = this.createCharacter();
                    character.image = file.url;
                    character.name = file.name.replace(/\.[^/.]+$/, '');
                    await this.addCharacterCollection(character);
                });
            } catch (err) {
                this.showError(err);
            }
            this.$refs.uploader.value = '';
        },
        mapEditTrigger({ map }) {
            this.$refs.scene.onMapEdit({ map });
        },
        createCharacter() {
            const character = new Character();
            character.tokenSize = 2;
            return character;
        },
    },
};
</script>

<style>
body {
    margin: 0;
}
.map-header {
    width: 100%;
    display: flex;
    flex-direction: row;
}
.map-header div {
    flex-grow: 1;
}
.map-header svg {
    height: 30px;
}
</style>
