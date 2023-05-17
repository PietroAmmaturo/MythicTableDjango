<template>
    <div class="campaign-edit-container">
        <transition name="fade">
            <div
                class="preview-background"
                :key="campaign.imageUrl"
                :style="{ 'background-image': `url(${previewImg || campaign.imageUrl})` }"
            />
        </transition>
        <CampaignEditForm :campaign="campaign" @finished="exitEditor" @img-preview="previewFile($event)" />
    </div>
</template>

<script>
import axios from 'axios';
import { mapActions } from 'vuex';

import CampaignEditForm from '@/campaigns/components/CampaignEditForm';

export default {
    components: {
        CampaignEditForm,
    },
    data() {
        return {
            campaign: {
                id: null,
                name: '',
                owner: '',
                description: '',
                players: [],
                imageUrl: '',
            },
            previewImg: '',
        };
    },
    beforeRouteEnter(to, from, next) {
        if (to.params.id) {
            axios
                .get(`/api/campaigns/${to.params.id}`)
                .then(response => {
                    next(vueMethods => vueMethods.setData(response.data));
                })
                .catch(error => {
                    next(vueMethods => vueMethods.setError(error));
                });
        } else {
            next();
        }
    },
    methods: {
        previewFile(url) {
            this.previewImg = url;
        },
        ...mapActions('errors', {
            showError: 'modal',
        }),
        setData(data) {
            this.campaign = data;
        },
        setError() {
            this.error = 'Error loading campaign to edit.';
        },
        exitEditor() {
            history.back();
        },
    },
};
</script>

<style lang="scss" scoped>
.campaign-edit-container {
    overflow: hidden;
}

.preview-background {
    position: fixed;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    z-index: 0;
    filter: blur(60px);
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
}

//fade transition
.fade-enter-active,
.fade-leave-active {
    transition: opacity 2s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
}
</style>
