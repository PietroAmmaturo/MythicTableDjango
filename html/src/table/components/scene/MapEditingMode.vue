<template>
    <section ref="editingContainer" class="editing-mode-container">
        <h1>Editing Map:</h1>
        <menu class="edit-options">
            <li>
                <button @click="() => triggerZIndexMove(-1)">
                    <img
                        src="/static/icons/layout/layer-move-down.svg"
                        alt="Move Down, move selected image(s) down in visual order."
                    />
                </button>
            </li>
            <li>
                <button @click="() => triggerZIndexMove(1)">
                    <img
                        src="/static/icons/layout/layer-move-up.svg"
                        alt="Move Up, move selected image(s) up in visual order."
                    />
                </button>
            </li>
            <li>
                <button @click="triggerRemove">
                    <img class="trash" src="/static/icons/layout/delete.svg" alt="Trash, remove selected image(s)." />
                </button>
            </li>
            <li>
                <button @click="closeEditingMode">
                    <img src="/static/icons/layout/close.svg" alt="Close, exist map editing mode." />
                </button>
            </li>
            <li class="info" @click="showTutorial = true">
                <button>
                    <img src="/static/icons/layout/info.svg" alt="Info, find out more about map editing mode." />
                </button>
            </li>
        </menu>
        <div class="image-uploader" @click="triggerUploader">
            <input ref="uploader" type="file" accept="image/*" multiple @change="uploadImage" />
            <img src="/static/icons/layout/upload.svg" alt="Upload symbol." />
            <p>
                To add map images <strong>drag and drop</strong> your image files into the area above, or
                <strong>click here</strong> to choose from file.
            </p>
        </div>
        <TutorialModal v-if="showTutorial" @close="showTutorial = false">
            <MapEditingTutorial />
        </TutorialModal>
    </section>
</template>

<script>
import { mapMutations, mapActions } from 'vuex';

import TutorialModal from '@/core/components/TutorialModal.vue';
import MapEditingTutorial from './MapEditingTutorial.vue';
import { sceneEventBus } from '@/table/utils/sceneEventBus.js';
import { addMap } from '@/core/api/files/files.js';

export default {
    components: {
        TutorialModal,
        MapEditingTutorial,
    },
    data() {
        return {
            showTutorial: false,
        };
    },
    methods: {
        ...mapMutations('editingModes', {
            setEditMap: 'setEditMap',
        }),
        ...mapActions('errors', {
            showError: 'modal',
        }),
        triggerRemove() {
            sceneEventBus.$emit('removeMapImages');
        },
        triggerZIndexMove(step) {
            sceneEventBus.$emit('moveMapImagesZIndex', step);
        },
        triggerUploader() {
            this.$refs.uploader.click();
        },
        closeEditingMode() {
            this.setEditMap(false);
        },
        async uploadImage(event) {
            let files = event?.target?.files;
            this.$refs.editingContainer.parentNode.style.cursor = 'wait';
            try {
                const serverResponse = await addMap(files);
                const event = { x: 0, y: 0 };
                this.$emit('addMaps', { files: serverResponse.data.files, event });
            } catch (err) {
                console.warn(err);
                this.showError(err);
            } finally {
                this.$refs.uploader.value = '';
                this.$refs.editingContainer.parentNode.style.cursor = 'default';
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.editing-mode-container {
    position: absolute;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    border: 7.5px solid #21a0a0;
    pointer-events: none;
    z-index: 1;
}
h1 {
    position: absolute;
    right: 50%;
    top: 0.5rem;
    height: 5rem;
    padding: 1rem;
    font-size: 2.25rem;
    border-radius: 25px 0 0 25px;
    background: linear-gradient(90deg, #31313acc 0%, #31313ae6 100%);
    backdrop-filter: blur(10px) saturate(140%);
    pointer-events: auto;
}
menu {
    display: flex;
    margin: 0 0 0 0;
    align-items: center;
}
li {
    list-style-type: none;
}
.edit-options {
    position: absolute;
    display: flex;
    top: 0.5rem;
    left: 50%;
    width: fit-content;
    height: 5rem;
    padding: 1rem;
    border: 2px solid #21a0a0;
    border-radius: 0 40px 40px 0;
    background: linear-gradient(90deg, #444444cc 100%, #44444480 0%);
    backdrop-filter: blur(10px) saturate(140%);
    pointer-events: auto;
    button {
        display: flex;
        width: 45px;
        height: 45px;
        align-items: center;
        justify-content: center;
        margin: 0 0 0 0;
        padding: 0 0 0 0;
        box-sizing: content-box;
        border-radius: 50%;
        background-color: #ffffff00;
        img {
            height: 40px;
        }
        .trash {
            height: 28px;
        }
    }
    button:hover {
        box-shadow: 0 0 3px #21a0a0;
    }
    li:first-of-type {
        margin: 0 0 0 0;
    }
    li {
        margin: 0 0 0 25px;
    }
}
.image-uploader {
    display: flex;
    flex-direction: column;
    position: absolute;
    left: 50%;
    bottom: 1rem;
    transform: translateX(-50%);
    width: 25rem;
    padding: 1rem;
    border: 2px solid #21a0a0;
    border-radius: 25px;
    background: linear-gradient(90deg, #31313acc 0%, #31313ae6 100%);
    backdrop-filter: blur(10px) saturate(140%);
    pointer-events: auto;
    cursor: pointer;
    input {
        display: none;
    }
    img {
        align-self: center;
    }
    p {
        margin: 0 0 0 0;
        text-align: center;
    }
}
.info {
    position: absolute;
    right: -4px;
    top: -6px;
    margin: 0 0 0 0;
    button {
        display: flex;
        align-items: center;
        width: 25px;
        height: 25px;
        margin: 0 0 0 0;
        padding: 0 0 0 0;
        border: transparent;
    }
}
</style>
