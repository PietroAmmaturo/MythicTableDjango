<template>
    <transition name="modal">
        <div class="modal-mask" :v-show="show">
            <div
                :class="['modal-container', `modal-container--${variant}`]"
                :id="cssid"
                @keyup.esc="onEscape"
                tabindex="0"
                ref="modal"
            >
                <slot />
            </div>
        </div>
    </transition>
</template>

<script lang="ts">
import { mapMutations } from 'vuex';
import { v4 as uuid } from 'uuid';

export default {
    props: {
        show: {
            type: Boolean,
            default: false,
        },
        cssid: {
            type: String,
            default: '',
        },
        variant: {
            type: String,
            default: '',
            // Design docs here allow for one-panel variant which I'm not currently adding.
            // Adjust validator if someone adds it later.
            // https://gitlab.com/mythicteam/mythictable/-/wikis/%5BDRAFT%5D-Design-Guidelines
            validator(val) {
                return !val || ['minified'].includes(val);
            },
        },
    },
    mounted() {
        this.id = uuid();
        this.pushDisplayedModal(this.id);
        this.$refs.modal.focus();
    },
    destroyed() {
        this.popDisplayedModal(this.id);
    },
    methods: {
        ...mapMutations('window', {
            pushDisplayedModal: 'pushDisplayedModal',
            popDisplayedModal: 'popDisplayedModal',
        }),
        onEscape() {
            this.$emit('escape', {});
        },
    },
};
</script>

<style scoped>
.modal-mask {
    backdrop-filter: blur(3px);
}
@media screen and (max-width: 900px) {
    .modal-container {
        width: 95% !important;
        min-width: 350px !important;
        min-height: 200px !important;
    }
}
.modal-container {
    position: relative;
    width: 850px;
    padding: 0px !important;
    border-radius: 30px;
    overflow: hidden;
}
</style>
