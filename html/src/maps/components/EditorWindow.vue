<template>
    <transition name="modal">
        <div class="modal-mask">
            <div class="modal-wrapper">
                <div class="modal-container" :style="{ 'background-image': backgroundImage }">
                    <div class="left-panel">
                        <div id="metadata">
                            {{ modifiedMap.stage.bounds.se.q }} x {{ modifiedMap.stage.bounds.se.r }}
                        </div>
                        <div class="left-panel-button-container" v-if="isEditable()">
                            <button class="left-panel-button" v-if="canEnterMapEditMode" @click="onEditClicked">
                                <img src="/static/icons/layout/draw.svg" /> Edit Map
                            </button>
                            <button class="left-panel-button show-to-players" @click="togglePrivate">
                                <img :src="visibilityButton.image" /> {{ visibilityButton.text }}
                            </button>
                        </div>
                    </div>
                    <div class="right-panel action-buttons-container" :class="{ private: modifiedMap.private }">
                        <fieldset>
                            <legend>Name</legend>
                            <input v-model="modifiedMap.name" type="textarea" :disabled="!isEditable()" />
                        </fieldset>
                        <fieldset>
                            <legend>Notes</legend>
                            <!-- if this could be hooked up to a store for "notes" -->
                            <textarea
                                class="no-resize"
                                v-model="modifiedMap.notes"
                                :disabled="!isEditable()"
                            ></textarea>
                        </fieldset>
                        <legend style="font-size:1.5em;">Grid</legend>
                        <div class="grid-settings" v-if="isEditable()">
                            <div>
                                <legend>Color</legend>
                                <div v-if="isEditable()" class="color-selector">
                                    <ColorPalettePicker :colorList="colorList" v-model="modifiedMap.stage.grid.color" />
                                </div>
                            </div>
                            <div>
                                <legend>Fullness</legend>
                                <VueSlider
                                    v-model="lineFullness"
                                    tooltip="none"
                                    marks
                                    hide-label
                                    :interval="0.05"
                                    :min="0.1"
                                    :max="1"
                                />
                            </div>
                        </div>

                        <fieldset v-if="isEditable()">
                            <legend>Size (Pixels)</legend>
                            <input v-model.number="modifiedMap.stage.grid.size" type="number" />
                        </fieldset>

                        <div class="action-buttons">
                            <button class="modal-button selected" v-if="isEditable()" @click="onSave">
                                {{ saveButton }}
                            </button>
                            <button class="modal-button" v-if="isEditable()" @click="onCancel">Cancel</button>
                            <button class="modal-button" v-else @click="onCancel">Close</button>
                            <button
                                class="modal-button accent-red delete"
                                v-show="showDelete && isEditable()"
                                @click="onDelete"
                            >
                                <img src="/static/icons/layout/delete.svg" alt="" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
import * as jsonpatch from 'fast-json-patch';
import _ from 'lodash';
import { mapActions, mapState, mapMutations, mapGetters } from 'vuex';
import ColorPalettePicker from '@/core/components/ColorPalettePicker.vue';

import { MAP } from '@/maps/constants.js';
import { addMap } from '@/core/api/files/files.js';

import defaultMap from '@/maps/map_model.js';
import { defaultElement } from '@/maps/map_model.js';

import VueSlider from 'vue-slider-component';
import {} from 'vue-slider-component/theme/default.css';

function getImageDimensions(src) {
    return new Promise((resolve, reject) => {
        let image = new Image();
        image.onload = () => resolve({ width: image.width, height: image.height });
        image.onerror = reject;
        image.src = src;
    });
}

export default {
    components: {
        ColorPalettePicker,
        VueSlider,
    },
    data: function() {
        return {
            showMapSelector: false,
            map: null,
            modifiedMap: defaultMap,
            saveButton: 'Save',
            showDelete: false,
            colorList: ['#ffffff', '#000000', '#3802b8', '#21a0a0', '#1ba73e', '#c02d0c', '#f18701'],
            colour: '#000',
        };
    },
    computed: {
        ...mapState('profile', {
            me: 'me',
        }),
        visibilityButton() {
            let buttonOpts = {
                image: '/static/icons/layout/invisible.svg',
                text: 'Hide from Players',
            };
            if (this.modifiedMap.private) {
                buttonOpts = {
                    image: '/static/icons/layout/visible.svg',
                    text: 'Show to Players',
                };
            }
            return buttonOpts;
        },
        backgroundImage() {
            return 'url(' + this.modifiedMap.stage.elements[0]?.asset.src + ')';
        },
        canEnterMapEditMode() {
            return this.modifiedMap._id && this.hasPermissionFor('editAnyMap');
        },
        lineFullness: {
            get() {
                return this.modifiedMap.stage.grid.lineFullness ?? 0.35;
            },
            set(value) {
                this.modifiedMap.stage.grid.lineFullness = value;
            },
        },
    },
    watch: {
        map: function() {
            if (this.map) {
                this.modifiedMap = _.cloneDeep(this.map);
                if (!this.modifiedMap.stage.grid.offset) {
                    this.modifiedMap.stage.grid.offset = { x: 0, y: 0 };
                }
            }
        },
    },
    methods: {
        ...mapMutations('editingModes', {
            setEditMap: 'setEditMap',
            setHiddenSidebar: 'setHiddenSidebar',
        }),
        ...mapActions('errors', {
            showError: 'modal',
        }),
        ...mapGetters('hasPermission', {
            hasPermissionFor: 'hasPermissionFor',
        }),
        ...mapActions('players', {
            changeMap: 'changePlayerMap',
            findPlayer: 'findPlayerFromProfileId',
        }),
        onEditClicked() {
            this.setEditMap(true);
            this.setHiddenSidebar(true);
            this.changeMapForEditing();
            this.onSave();
        },
        async uploadImage(event) {
            if (!event) {
                return;
            }
            let files;
            files = event?.target?.files;
            try {
                const result = await addMap(files);
                result.data.files.forEach(file => {
                    const element = _.cloneDeep(defaultElement);
                    element.asset.src = file.url;
                    element.id = file.id;
                    this.modifiedMap.stage.elements.push(element);
                });
            } catch (err) {
                this.showError(err);
            }
            this.$refs.uploader.value = '';
        },
        async onSave() {
            if (
                this.map.stage.elements[0]?.asset.src !== this.modifiedMap.stage.elements[0]?.asset.src ||
                this.map.stage.grid.size !== this.modifiedMap.stage.grid.size
            ) {
                const dim = await getImageDimensions(this.modifiedMap.stage.elements[0]?.asset.src);
                this.modifiedMap.stage.bounds.se = {
                    q: Math.floor(dim['width'] / (this.modifiedMap.stage.grid.size * (MAP.MAGIC_SCALE / 50))),
                    r: Math.floor(dim['height'] / (this.modifiedMap.stage.grid.size * (MAP.MAGIC_SCALE / 50))),
                };
            }
            if (this.map._id) {
                const patch = jsonpatch.compare(this.map, this.modifiedMap);
                if (patch.length > 0) {
                    this.$emit('onChange', { id: this.map._id, patch: patch });
                    this.map = null;
                    return;
                }
                this.$emit('onCancel');
            } else {
                this.$emit('onAdd', { map: this.modifiedMap });
                this.map = null;
            }
        },
        onChange() {
            this.modifiedMap = { ...this.modifiedMap };
        },
        onCancel() {
            this.map = null;
            this.$emit('onCancel');
        },
        onDelete() {
            const mapId = this.map._id;
            this.map = null;
            this.$emit('onDelete', { mapId });
        },
        togglePrivate() {
            this.modifiedMap.private = !this.modifiedMap.private;
            this.onChange();
        },
        isEditable() {
            return this.hasPermissionFor('editAnyMap');
        },
        async changeMapForEditing() {
            const player = await this.findPlayer(this.me.id);
            this.changeMap({ mapId: this.modifiedMap._id, player });
        },
    },
};
</script>
<style lang="scss" scoped>
.modal-container {
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
}
.right-panel {
    transition: margin-left 1s, opacity 1s;
    background: #31313afa;
    backdrop-filter: blur(4px);
    border-left: 0.5em solid #21a0a0;
    transition: border-left 0.5s;
    h1 {
        font-weight: 400;
        font-size: 2em;
    }
    &.private {
        border-left: 0.5em solid #c02d0c;
    }
}
.left-panel {
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    transition: flex 1s;
    position: relative;
    background: none;
}
.left-panel:hover ~ .right-panel {
    margin-left: 60px;
    transition: margin-left 0.5s, opacity 0.5s;
    opacity: 0;
    backdrop-filter: blur(0px);
    pointer-events: none;
}
#metadata {
    position: absolute;
    top: 20px;
    left: 20px;

    background: #31313ae5;
    padding: 20px;
    border-radius: 15px 5px 5px 5px;

    font-size: 25px;

    opacity: 0;
    transition: opacity 1s;
}
.left-panel:hover #metadata {
    transition: opacity 0.5s;
    opacity: 1;
}
/* Left Panel Interactions */
.left-panel-button-container {
    position: absolute;
    bottom: 20px;
    left: 10px;
    float: left;
}
.left-panel-button {
    background: #31313ad0;
    border-radius: 15px;

    border: none;
    padding: 8px 10px 8px 10px;
    &:hover {
        background: #31313aef;
    }
    img {
        margin-bottom: 2px;
        margin-right: 0.35em;
        height: 1.25em;
    }
}

/* Right Panel Interactions */
.grid-style {
    width: 5em;
    height: 5em;
    background: #444545;
    padding: 8px;
    display: inline-block;
    margin: 4px;
    vertical-align: bottom;
    border-radius: 8px;
}

.modal-button {
    margin: 3px 2px;
}

/* Common input styling */
input,
textarea {
    width: 100%;
}
input:disabled,
textarea:disabled {
    background: none;
}
div.expand {
    flex-grow: 1;
    overflow: hidden;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
}
.grid-settings {
    display: grid;
    grid-template-columns: 50% 50%;
}
</style>
