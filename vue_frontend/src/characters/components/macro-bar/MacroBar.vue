<template>
    <section>
        <ExpandedMacroBar
            v-if="!minimizeMacroBar"
            @toggle-macro-bar="minimizeMacroBar = true"
            :macros="macros"
            :defaultMacros="defaultMacros"
            :context="context"
            :activeToken="activeToken"
            :hiddenSidebar="hiddenSidebar"
            :returnDice="returnDice"
            @triggerMacro="triggerMacro"
        >
            <CharacterToken
                v-if="activeToken && activeToken.image && activeToken.macros"
                :image="activeToken.image"
                :mode="activeToken.borderMode"
                :color="activeToken.borderColor"
                :icon="activeToken.icon"
                :editor="false"
                :scale="0.2"
                size="50px"
            />
        </ExpandedMacroBar>

        <MinimizedMacroBar v-if="minimizeMacroBar" @toggle-macro-bar="miniMacroRendering" :showSlot="showMiniDisplay">
            <menu class="macro-options">
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

                <ul class="macro-list" v-if="macros">
                    <Macro
                        v-for="(macro, index) in macros"
                        :key="index"
                        :macro="macro"
                        :index="index"
                        :context="context"
                        :enableEditing="false"
                    />
                </ul>
                <div />
            </menu>
        </MinimizedMacroBar>
    </section>
</template>

<script>
import { mapState } from 'vuex';
import moment from 'moment';
import _ from 'lodash';

import ExpandedMacroBar from './ExpandedMacroBar.vue';
import MinimizedMacroBar from './MinimizedMacroBar.vue';
import CharacterToken from '@/characters/components/CharacterToken.vue';
import Macro from '../character-editor/Macro.vue';
import getDieImage from '@/chat/components/dice/getDieImage.js';

export default {
    components: {
        ExpandedMacroBar,
        MinimizedMacroBar,
        CharacterToken,
        Macro,
    },
    data() {
        return {
            minimizeMacroBar: false,
            showMiniDisplay: false,
            activeMiniDisplayAt: 775,
            defaultMacros: ['1d20', '1d10', '1d4', '1d6', '1d8', '1d12'],
        };
    },
    computed: {
        ...mapState('live', {
            sessionId: 'sessionId',
            director: 'director',
        }),
        ...mapState('profile', {
            me: 'me',
        }),
        ...mapState('tokens', {
            activeToken: 'selectedToken',
        }),
        ...mapState('window', {
            windowSize: 'windowSize',
        }),
        ...mapState('editingModes', {
            hiddenSidebar: 'hiddenSidebar',
            isMapEditing: 'editMap',
        }),
        macros() {
            return _.isEmpty(this.activeToken.macros) ? this.defaultMacros : this.activeToken.macros;
        },
        context() {
            return {
                id: this.activeToken._id,
                name: this.activeToken.name,
                image: this.activeToken.image,
                mode: this.activeToken.borderMode,
                color: this.activeToken.borderColor,
                icon: this.activeToken.icon,
                type: 'token',
            };
        },
        miniMacroRendering() {
            let windowBoolean = this.windowSize.width < this.activeMiniDisplayAt;
            if (!windowBoolean && !this.hiddenSidebar && this.windowSize.width - 350 < this.activeMiniDisplayAt) {
                windowBoolean = true;
            }
            return windowBoolean ? this.toggleMiniDisplay : this.minimizeBar;
        },
    },
    watch: {
        windowSize() {
            this.handleWindowSize();
        },
        hiddenSidebar() {
            this.handleSideBarVisible();
        },
        isMapEditing(isEditing) {
            if (isEditing) {
                this.minimizeMacroBar = true;
            }
        },
    },
    beforeMount() {
        this.handleWindowSize();
    },
    methods: {
        triggerMacro(macro) {
            let message = {
                timestamp: +moment(),
                userId: this.me.id,
                displayName: this.me.displayName,
                sessionId: this.sessionId,
                message: macro,
                context: this.context,
            };
            this.director.submitRoll(message);
        },
        returnDice(macro) {
            let solvedDice = macro.match(/(\d+)[?:d](\d+)/);
            return solvedDice instanceof Array
                ? getDieImage(Number(solvedDice[2]))
                : '/static/icons/layout/mythic_logo.svg';
        },
        minimizeBar() {
            this.minimizeMacroBar = false;
        },
        toggleMiniDisplay() {
            this.showMiniDisplay = !this.showMiniDisplay;
        },
        handleSideBarVisible() {
            if (!this.hiddenSidebar && this.activeMiniDisplayAt > this.windowSize - 350) {
                this.minimizeMacroBar = true;
            }
        },
        handleWindowSize() {
            if (this.windowSize.width < this.activeMiniDisplayAt) this.minimizeMacroBar = true;
            if (this.windowSize.width > this.activeMiniDisplayAt) this.showMiniDisplay = false;
            this.handleSideBarVisible();
        },
    },
};
</script>
