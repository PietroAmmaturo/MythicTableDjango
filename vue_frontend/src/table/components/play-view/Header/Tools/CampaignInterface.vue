<template>
    <ul>
        <button v-if="activeCampaign.joinId" @click="copyInvite" v-tooltip="copyTooltip">
            <p>Invitation Link</p>
            <img :src="copyImage" :alt="copyText" :class="{ 'invite-copied': copiedInvite }" />
        </button>
        <unleash-feature name="gm-controls-access">
            <button @click="openGmControls">Game Master Controls</button>
        </unleash-feature>
        <button @click="anotherCampaign">Open Another Campaign</button>
        <button @click="openEditor">Edit: {{ activeCampaign.name }}</button>
    </ul>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import { newTabRoutes } from '@/app/router.js';

export default {
    data() {
        return {
            copiedInvite: false,
        };
    },
    computed: {
        ...mapState('campaigns', {
            activeCampaign: 'activeCampaign',
        }),
        copyImage() {
            return this.copiedInvite ? '/static/icons/layout/check.svg' : '/static/icons/layout/link.svg';
        },
        copyText() {
            return this.copiedInvite ? 'Success icon' : 'Link icon';
        },
        copyTooltip() {
            return this.copiedInvite ? 'Link copied!' : 'Copy to clipboard.';
        },
    },
    methods: {
        ...mapMutations('campaigns', {
            openEditor: 'toggleDisplayEditModal',
        }),
        ...mapMutations('gmPermissions', {
            openGmControls: 'toggleDisplayGmControlsModal',
        }),
        editCampaign() {
            this.$router.push({ path: `/edit/${this.activeCampaign.id}` });
        },
        copyInvite() {
            this.$clipboard(`${window.location.origin}/invite/${this.activeCampaign.joinId}`);
            this.copiedInvite = true;
        },
        anotherCampaign() {
            newTabRoutes.campaigns();
        },
    },
};
</script>

<style lang="scss" scoped>
ul button {
    box-sizing: border-box;
    position: relative;
    display: flex;
    justify-content: center;
    margin: 0;
    margin-bottom: 5px;
    width: 100%;
    min-width: fit-content;
    font-weight: 600;
    font-size: 1rem;
    background-color: #31313a;
}
button:hover {
    box-shadow: 0 0 3px var(--white);
}
p {
    margin: 0;
    padding: 0 2.5rem 0 0;
}
button > img {
    position: absolute;
    box-sizing: content-box;
    right: 0;
    top: 0;
    height: 100%;
    background-color: gray;
    border-radius: inherit;
}
.invite-copied {
    background-color: #1ba73e;
}
</style>
