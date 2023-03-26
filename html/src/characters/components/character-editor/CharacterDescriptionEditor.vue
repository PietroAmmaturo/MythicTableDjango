<template>
    <div class="details">
        <fieldset>
            <legend>Name</legend>
            <input v-model="modified.name" type="textarea" @input="onChange" />
        </fieldset>
        <div class="expand">
            <legend>Description</legend>
            <textarea v-model="modified.description" @input="onChange" />
        </div>
        <legend>Macros</legend>
        <Draggable class="macro-list" :list="modified.macros" :disabled="disableDrag" @end="onChange">
            <Macro
                v-for="(macro, index) in modified.macros"
                :key="index"
                :context="context"
                :macro="macro"
                :index="index"
                @changed="macroChange"
                @remove="macroDelete"
                @editing="toggleMacroDrag"
            />
        </Draggable>
        <svg
            viewBox="0 0 16 16"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            class="add-macro"
            @click="addMacro"
        >
            <path
                fill-rule="evenodd"
                d="M8 3.5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5H4a.5.5 0 0 1 0-1h3.5V4a.5.5 0 0 1 .5-.5z"
            />
            <path fill-rule="evenodd" d="M7.5 8a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1H8.5V12a.5.5 0 0 1-1 0V8z" />
        </svg>
    </div>
</template>

<script>
import Vue from 'vue';
import Draggable from 'vuedraggable';
import Macro from './Macro.vue';
export default {
    components: {
        Macro,
        Draggable,
    },
    props: {
        value: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            disableDrag: false,
        };
    },
    computed: {
        modified: {
            get() {
                return this.value;
            },
            set(modified) {
                this.$emit('input', modified);
            },
        },
        context: {
            get() {
                return {
                    id: this.modified._id,
                    name: this.modified.name,
                    image: this.modified.image,
                    mode: this.modified.borderMode,
                    color: this.modified.borderColor,
                    icon: this.modified.icon,
                    type: 'token',
                };
            },
        },
    },
    methods: {
        onChange() {
            this.modified = { ...this.modified };
        },
        addMacro() {
            if (!this.modified.macros) {
                Vue.set(this.modified, 'macros', []);
            }
            this.modified.macros.push('New Macro [[1d20]]');
            this.modified = { ...this.modified };
        },
        toggleMacroDrag() {
            this.disableDrag = !this.disableDrag;
        },
        macroChange(macro) {
            this.modified.macros.splice(macro.index, 1, macro.edited);
            this.modified = { ...this.modified };
        },
        macroDelete(index) {
            this.modified.macros.splice(index, 1);
            this.modified = { ...this.modified };
        },
    },
};
</script>

<style scoped lang="scss">
.details {
    height: 100%;
    display: flex;
    flex-direction: column;
}
input,
textarea {
    width: 100%;
    border-radius: 8px;
    box-sizing: border-box;
    border: 2px solid #1670b100;
    background: #444;
    color: #fff;
}
input:focus,
textarea:focus {
    outline: none !important;
    box-shadow: none !important;
    border: 2px solid #274d78;
}
input {
    font-weight: bold;
}
textarea {
    flex-grow: 1;
    position: relative;
    resize: none;
}
div.expand {
    flex-grow: 1;
    overflow: hidden;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    margin-bottom: 8px;
}
.details svg {
    height: 30px;
}
.macro-list {
    max-height: 150px;
    padding: 8px;
    overflow-y: auto;
}
.add-macro {
    display: inline-block;
    margin-bottom: 0.5em;
    padding: 4px 0;
    cursor: pointer;
    width: calc(100% - 2em);
    border-radius: 10px;
    background: #2c2c2cc7;
    align-self: center;
    &:hover {
        background: #1f1f1fe8;
    }
    &:active {
        transform: scale(0.95);
    }
}
</style>
