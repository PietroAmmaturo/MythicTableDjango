<template>
    <ul>
        <button v-on:click="goToAccount">Account</button>
        <button v-on:click="showProfileEditor">Edit Profile</button>
        <button v-on:click="signOutOidc">Sign Out</button>
    </ul>
</template>

<script>
import { mapActions } from 'vuex';
import { newTabRoutes } from '@/app/router.js';

export default {
    methods: {
        ...mapActions(['signOutOidc', 'oidcSignInCallback']),
        ...mapActions('profile', {
            showEditor: 'edit',
        }),
        goToAccount() {
            newTabRoutes.accountProfile();
        },
        showProfileEditor() {
            this.showEditor(true);
        },
    },
};
</script>

<style lang="scss" scoped>
ul button {
    box-sizing: border-box;
    margin: 0;
    margin-bottom: 5px;
    padding-left: 50px;
    padding-right: 50px;
    width: 100%;
    min-width: fit-content;
    font-weight: 600;
    font-size: 1rem;
    background-color: #31313a;
}
ul button:last-child {
    margin: 0;
    background-color: var(--danger);
}
button:hover {
    box-shadow: 0 0 3px var(--white);
}
</style>
