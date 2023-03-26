<template>
    <CampaignEditForm :campaign="campaign" @finished="close($event)" v-if="display" />
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex';

import CampaignEditForm from '@/campaigns/components/CampaignEditForm';

export default {
    components: {
        CampaignEditForm,
    },
    computed: {
        ...mapState('campaigns', {
            campaign: 'activeCampaign',
            display: 'displayEditModal',
        }),
    },
    methods: {
        ...mapMutations('campaigns', {
            toggleDisplay: 'toggleDisplayEditModal',
        }),
        ...mapActions('campaigns', {
            getActiveCampaign: 'getActiveCampaign',
        }),
        close(event) {
            if (event.saved) {
                this.getActiveCampaign(this.campaign.id);
            }
            this.toggleDisplay();
        },
    },
};
</script>
