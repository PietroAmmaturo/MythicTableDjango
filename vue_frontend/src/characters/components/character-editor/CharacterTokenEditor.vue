<template>
    <fieldset class="token-editor">
        <legend>Style</legend>
        <div class="mode-selector">
            <div
                v-for="mode in modeList"
                :key="mode.id"
                class="selector"
                @click="setMode(mode.id)"
                :class="checkModeSelected(mode.id)"
            >
                <div class="label">{{ mode.caption }}</div>
                <CharacterToken :image="modified.image" :mode="mode.id" :color="modified.borderColor" size="170px" />
            </div>
        </div>
        <legend>Color</legend>
        <div class="color-selector">
            <div
                v-bind:key="c"
                v-for="c in colorList"
                :id="c"
                v-bind:style="{ backgroundColor: c }"
                v-bind:class="getClass(c)"
                v-on:click="selectColor(c)"
            />
            <div class="customColor" @click="showColorPicker = true">
                <svg viewBox="0 0 16 16" class="bi bi-plus" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path
                        fill-rule="evenodd"
                        d="M8 3.5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5H4a.5.5 0 0 1 0-1h3.5V4a.5.5 0 0 1 .5-.5z"
                    />
                    <path fill-rule="evenodd" d="M7.5 8a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1H8.5V12a.5.5 0 0 1-1 0V8z" />
                </svg>
            </div>
        </div>
        <transition name="slide">
            <ColorPicker
                :initial-color="modified.borderColor"
                @color="selectColor"
                v-if="showColorPicker"
                @close="showColorPicker = false"
                :key="showColorPicker"
            />
        </transition>
        <legend>Size</legend>
        <div class="sizeSelector">
            <div
                v-bind:key="s.id"
                v-for="s in sizeList"
                :id="s.id"
                class="selector"
                v-bind:class="getSizeClass(s)"
                v-on:click="selectSize($event, s)"
            >
                <div class="label">
                    {{ s.caption }}
                    <div class="detail">{{ s.detail }}</div>
                </div>
            </div>
        </div>
        <legend>Icon</legend>
        <IconSelector v-model="modified.icon" @input="setIcon" />
    </fieldset>
</template>

<script>
import CharacterToken from '../CharacterToken.vue';
import ColorPicker from '@/core/components/CustomColorPicker.vue';
import IconSelector from '@/core/components/IconSelector/IconSelector';
export default {
    components: {
        CharacterToken,
        ColorPicker,
        IconSelector,
    },
    props: {
        value: {
            type: Object,
            required: true,
        },
    },
    data: function() {
        return {
            showColorPicker: false,
            colorList: ['#ffffff', '#000000', '#274d78', '#3802b8', '#21a0a0', '#1ba73e', '#c02d0c', '#f18701'],
            sizeList: [
                { id: '1', caption: 'Tiny', detail: '0.5 x 0.5' },
                { id: '2', caption: 'Medium', detail: '1 x 1' },
                { id: '3', caption: 'Large', detail: '2 x 2' },
                { id: '4', caption: 'Huge', detail: '3 x 3' },
            ],
            modeList: [
                { id: 'coin', caption: 'Coin' },
                { id: 'tile', caption: 'Tile' },
                { id: 'circle', caption: 'Circle' },
                { id: 'square', caption: 'Square' },
            ],
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
    },
    methods: {
        checkModeSelected(mode) {
            return this.modified.borderMode == mode ? 'active' : '';
        },
        setMode(mode) {
            this.modified = { ...this.modified, borderMode: mode };
        },
        getClass(c) {
            return { active: this.modified.borderColor === c };
        },
        selectColor(c) {
            this.modified = { ...this.modified, borderColor: c };
        },
        getSizeClass(s) {
            return { active: this.modified.tokenSize === s.id };
        },
        selectSize(event, s) {
            this.modified = { ...this.modified, tokenSize: s.id };
        },
        setIcon(i) {
            this.modified = { ...this.modified, icon: i };
        },
    },
};
</script>

<style lang="scss" scoped>
.token-editor {
    height: 100%;
    overflow: auto;
    overflow-x: hidden;
    padding-right: 25px;
}
.mode-selector {
    display: flex;
    flex-direction: row;
}
.selector {
    margin: 0.25em;
    width: 8em;
    height: 8em;
    position: relative;
    overflow: hidden;
    padding: 0;
    background: #1c1c1c;
    border-radius: 1em;
    border: #1c1c1c 5px solid;
    cursor: pointer;

    transition: border-color 0.5s;

    > div:not(.label) {
        opacity: 0.2;
        position: absolute;
        bottom: 0;
        right: 1em;
        filter: blur(2px) saturate(0.2);
    }
    .label {
        position: absolute;
        bottom: 1em;
        left: 1em;
        z-index: 10;
        line-height: initial;
        .detail {
            color: #999;
        }
    }
}
.selector:hover {
    border-color: #292929;
}
.selector.active {
    border: #fff 5px solid;
    > div:not(.label) {
        opacity: 0.7;
    }
}
.color-selector {
    display: flex;
    line-height: 0.5rem;
    padding: 0.25rem;
    flex-direction: row;
}

.color-selector > div {
    cursor: pointer;
    border-radius: 100%;
    margin: 0.25rem;
    width: 2rem;
    height: 2rem;
    background: #3a3a3a;
    border: 4px solid #444545;
}

.color-selector > div.active {
    border: 4px solid #cccccc;
}

.color-selector > div:hover:not(.active) {
    opacity: 0.8;
}

.color-selector > div:active:not(.active, .custom) {
    opacity: 0.7;
    transform: scale(0.9);
}

.sizeSelector {
    display: flex;
    line-height: 0.5rem;
    padding: 0.25rem;
    .selector {
        height: 4.5em;
    }
}

select {
    width: 170px;
}

.slide-enter-active,
.slide-leave-active {
    transition: height 0.75s ease, opacity 0.5s ease;
}
.slide-enter,
.slide-leave-to {
    opacity: 0;
    height: 0px;
}
</style>
