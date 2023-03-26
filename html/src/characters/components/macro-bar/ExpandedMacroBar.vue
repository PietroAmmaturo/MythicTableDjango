<template>
    <ul :class="['macro-bar', !hiddenSidebar ? 'sidebar-active' : '']">
        <slot />

        <li
            v-for="(macro, index) in truncatedMacros"
            :key="index"
            :ref="`macroBar${index + 1}`"
            @click="triggerMacro(macro)"
        >
            <img
                :src="returnDice(macro)"
                alt="Icon representation of macro!"
                :title="`Press ${index + 1} or click to activate!`"
            />
            <p>{{ index + 1 }}</p>
            <p>
                {{ macro }}
                <span></span>
            </p>
        </li>

        <li class="macro-bar-options">
            <img
                ref="macroBar0"
                src="/static/icons/layout/retract-arrow-white.svg"
                alt="Show or collapse macro options and overflow."
                width="30px"
                :class="{ expand: !showMacroOptions }"
                @click="toggleMacroRender"
            />
            <p>0</p>

            <menu class="macro-options" v-if="showMacroOptions">
                <ul class="standard-dice-macros">
                    <img
                        v-for="(macro, index) in defaultMacros"
                        :key="index"
                        :src="returnDice(macro)"
                        :alt="`Macro: ${macro}`"
                        :title="macro"
                        @click="triggerMacro(macro)"
                    />
                </ul>

                <ul class="macro-list" v-if="macros.length > 9">
                    <Macro
                        v-for="(macro, index) in macros.slice(9)"
                        :key="index"
                        :macro="macro"
                        :index="index"
                        :context="context"
                        :enableEditing="false"
                    />
                </ul>
                <button class="modal-button expanded selected" @click="hideMacroBar">Minimize Macro Bar</button>
                <div />
            </menu>
        </li>
    </ul>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import Macro from '../character-editor/Macro.vue';

export default {
    components: {
        Macro,
    },
    props: {
        macros: {
            type: Array,
            required: true,
        },
        defaultMacros: {
            type: Array,
            required: true,
        },
        context: {
            type: Object,
            required: true,
        },
        activeToken: {
            type: Object,
            required: true,
        },
        hiddenSidebar: {
            type: Boolean,
            required: true,
        },
        returnDice: {
            type: Function,
            required: true,
        },
    },
    data() {
        return {
            showMacroOptions: false,
        };
    },
    computed: {
        ...mapState('keyboard', {
            pressedKey: 'pressedKey',
        }),
        truncatedMacros() {
            return this.macros.slice(0, 9);
        },
    },
    watch: {
        activeToken: function() {
            this.showMacroOptions = false;
        },
        pressedKey: function() {
            this.mappedKeys(this.pressedKey);
            this.clearKey();
        },
    },
    methods: {
        ...mapActions('keyboard', {
            clearKey: 'triggerComplete',
        }),
        hideMacroBar() {
            this.$emit('toggle-macro-bar');
        },
        triggerMacro(macro) {
            this.$emit('triggerMacro', macro);
        },
        toggleMacroRender() {
            this.showMacroOptions = !this.showMacroOptions;
        },
        mappedKeys(key) {
            let macro = this.$refs[`macroBar${key}`];
            if (macro instanceof Array) macro = macro[0];
            if (macro) macro.click();
        },
    },
};
</script>

<style lang="scss" scoped>
$icon-size: 35px;
$mini-icon-size: 25px;

.macro-bar {
    position: fixed;
    bottom: 4em;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    width: fit-content;
    background: rgba(49, 49, 58, 0.871);
    backdrop-filter: blur(5px);
    margin: 0;
    padding: 0.5em 1em;
    border-radius: $icon-size * 0.6;
    transition-property: bottom, left, transform, border-radius;
    transition-timing-function: ease-in-out;
    transition-duration: 0.75s;
    .circleToken.circleClass_selection {
        border: none;
    }
    li {
        position: relative;
        margin: 0;
        padding: 0;
        list-style: none;
        p {
            position: absolute;
            left: 5px;
            bottom: 0;
            z-index: 1;
            margin: 0;
        }
        p:nth-of-type(2) {
            display: none;
            position: absolute;
            left: 50%;
            bottom: calc(100% + 0.5em);
            transform: translateX(-50%);
            width: max-content;
            max-width: 150px;
            z-index: 1;
            margin: 0 0 8px 0;
            padding: 5px;
            background: #1c1c1cea;
            border-radius: 5px;
            span {
                position: absolute;
                left: 50%;
                top: 100%;
                transform: translateX(-50%);
                width: 10px;
                height: 10px;
                box-sizing: border-box;
                border: 5px solid;
                border-color: #1c1c1cea transparent transparent transparent;
            }
        }
        &:hover {
            p:nth-of-type(2) {
                display: block;
            }
        }
        border-right: #333 solid 3px;
        box-sizing: content-box;
        &:first-of-type {
            margin: 0 0 0 0.5em;
            border-radius: 8px 0 0 8px;
        }
        &:last-of-type {
            border: none;
            border-radius: 0 8px 8px 0;
        }
    }
    img {
        height: $icon-size;
        padding: $icon-size * 0.3 $icon-size * 0.5;
        border-radius: inherit;
        cursor: pointer;
        &:hover {
            background: #333;
        }
    }
    .macro-bar-options {
        position: relative;
    }
    .macro-options {
        position: absolute;
        bottom: calc(100% + 20px);
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 0;
        padding: 0;
        width: $mini-icon-size * 6 + ($mini-icon-size * 0.3) * 12 + 5 * 3;
        background-color: #1c1c1c;
        border: 3px solid #1c1c1c;
        border-radius: 8px;
        button {
            margin: 8px 2.5% 5px 2.5%;
        }
        div {
            position: absolute;
            left: 50%;
            top: 100%;
            transform: translateX(-50%);
            width: 18px;
            height: 16px;
            box-sizing: border-box;
            margin: 3px 0 0 0;
            border: 8px solid;
            border-color: #1c1c1cea transparent transparent transparent;
        }
    }
    @media screen and (max-width: 950px) and (min-width: 775px) {
        .macro-options {
            right: -1em;
            left: unset;
            transform: none;
            div {
                left: unset;
                right: 34px;
                top: 100%;
                transform: none;
                margin: 3px 0 0 0;
            }
        }
    }
    .standard-dice-macros {
        padding: 0 0 0 0;
        display: flex;
        flex-direction: row;
        list-style: none;
        img {
            height: $mini-icon-size;
            width: $mini-icon-size;
            padding: $mini-icon-size * 0.3 $mini-icon-size * 0.3;
            border-right: #333 solid 3px;
            box-sizing: content-box;
            &:first-child {
                border-radius: 8px 0 0 0;
            }
            &:last-child {
                border-radius: 0 8px 0 0;
                border: none;
            }
        }
    }
    .macro-list {
        box-sizing: border-box;
        padding: 5px 0 0 5%;
        width: 100%;
        max-height: 150px;
        overflow-y: auto;
        background-color: #31313a;
        border-radius: 0 0 8px 8px;
        li.macro {
            padding: 5px;
            margin: 0 0 5px 0;
            border-radius: 6px;
            grid-template-columns: auto;
        }
    }
    .expand {
        transform: scaleY(-1);
    }
    .modal-button {
        width: 95%;
    }
}
.macro-bar.sidebar-active {
    position: fixed;
    bottom: 0;
    left: 0;
    transform: none;
    width: fit-content;
    margin: 0;
    background: rgba(49, 49, 58, 0.871);
    backdrop-filter: blur(5px);
    padding: 0.5em 1em;
    border-radius: 0 $icon-size * 0.6 0 0;
    .macro-options {
        right: -1em;
        left: unset;
        transform: none;
        div {
            left: unset;
            right: 34px;
            top: 100%;
            transform: none;
            margin: 3px 0 0 0;
        }
    }
}
</style>
