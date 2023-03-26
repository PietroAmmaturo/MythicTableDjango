<template>
    <div class="user-dropdown" v-bind:class="{ hide: hide }">
        <div class="user-name">{{ user.displayName }}</div>
        <button @click="emitPress('account')">Account</button>
        <button @click="emitPress('edit-profile')">Edit Profile</button>
        <button @click="emitPress('sign-out')" class="accent-red-large">Sign Out</button>
    </div>
</template>

<script>
export default {
    props: {
        user: {
            type: Object,
            required: true,
        },
        hide: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            hidePanel: this.hide,
        };
    },
    methods: {
        emitPress(button) {
            this.$emit(button);
        },
    },
};
</script>

<style lang="scss" scoped>
.user-dropdown {
    position: fixed;
    top: 7em;
    right: 3em;
    border-radius: 2em;
    background: #1c1c1c;

    display: flex;
    flex-direction: column;
    padding: 2em;
    button {
        width: 300px;
        height: 3.25em;
        /* Override Bootstrap */
        margin: 4px 0px;
        padding: 0px;

        background: #444545;

        font-weight: normal;
        font-size: 15px;
    }
    button:hover {
        opacity: 0.8;
    }
    button:active {
        opacity: 0.6;
    }
    transition: margin-top 0.5s, opacity 0.5s;
    margin-top: 0px;
    opacity: 1;
}
.user-dropdown.hide {
    margin-top: -10px;
    opacity: 0;
    pointer-events: none;
}
.user-name {
    text-align: right;
    font-size: 30px;
    font-weight: bold;
    padding: 0.1em 0px 1em 0px;
    flex-shrink: 0;
}
</style>
