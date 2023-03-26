<template>
    <article class="header-panel">
        <div class="header-panel-icons">
            <img v-on:click="closePanel" class="main-image" :src="titleImageLocation" :alt="title" />
            <img
                v-if="actionImageLocation"
                v-on:click="action"
                :src="actionImageLocation"
                alt=""
                class="action-image"
                :class="{ 'header-panel-active': status }"
            />
        </div>
        <div class="divider"></div>
        <slot />
        <button v-on:click="closePanel" class="close-header-panel">
            <img src="/static/icons/layout/close.svg" alt="Close" />
        </button>
    </article>
</template>

<script>
export default {
    props: {
        title: {
            type: String,
            required: true,
        },
        titleImageLocation: {
            type: String,
            required: true,
        },
        actionImageLocation: {
            type: String,
            default: '',
        },
        status: {
            type: Boolean,
            default: false,
        },
    },
    methods: {
        closePanel() {
            this.$emit('close');
        },
        action() {
            this.$emit('action');
        },
    },
};
</script>
<style>
.header-panel-icons img {
    width: 100%;
}
</style>
