<template>
    <div id="campaign-list">
        <CampaignItem
            v-for="campaign in campaigns"
            :key="campaign.id"
            :campaign="campaign"
            @delete-campaign="deleteCampaign"
            @leave-campaign="leaveCampaign"
        />
        <CampaignAddItem />
    </div>
</template>

<script>
import axios from 'axios';
import { mapActions, mapState } from 'vuex';
import moment from 'moment';
import CampaignItem from './CampaignItem';
import CampaignAddItem from './CampaignAddItem';

export default {
    components: {
        CampaignItem,
        CampaignAddItem,
    },
    data() {
        return {
            campaigns: [],
            searchQuery: '',
            focusedCampaign: null,
            error: '',
            imageUrl: '',
            index: '',
            defaultCampaignImage: 'static/images/defaultCampaignImg.jpg',
        };
    },
    computed: {
        ...mapState('profile', {
            myProfile: 'me',
        }),
        filteredCampaigns: function() {
            return this.campaigns.filter(c => {
                c.created = moment(c.created, 'YYYY-MM-DD').format('MM/DD/YYYY');
                c.lastModified = moment(c.lastModified, 'YYYY-MM-DD').format('MM/DD/YYYY');
                if (c.lastModified == '01/01/0001') {
                    c.lastModified = 'Not played yet !';
                }
                return c.name.toLowerCase().includes(this.searchQuery.toLowerCase());
            });
        },
    },
    async beforeRouteEnter(to, from, next) {
        try {
            next(async vm => {
                const profile = await vm.me();
                console.log(JSON.stringify(profile));
                const response = await axios.get(`/api/campaigns`);
                vm.setData(response.data);
            });
        } catch (error) {
            next(vm => vm.setError(error));
        }
    },
    methods: {
        ...mapActions('profile', {
            me: 'me',
        }),
        setData(data) {
            this.campaigns = data;
        },
        setError() {
            this.error = 'Error loading campaign list.';
        },
        focusCampaign(campaign) {
            this.focusedCampaign = campaign;
        },
        display(campaign, i) {
            this.campaign = campaign;
            this.index = i;
        },
        unfocusCampaign() {
            this.focusedCampaign = null;
        },
        playClick(campaign) {
            let date = new Date();
            campaign.lastModified = moment(date, 'YYYY-MM-DD').format('MM/DD/YYYY');
            this.campaign = campaign;
            let method = this.campaign.id ? 'put' : 'post';
            axios[method]('/api/campaigns', this.campaign).then(() => {});
        },
        refresh() {
            axios
                .get(`/api/campaigns`)
                .then(response => {
                    this.setData(response.data);
                })
                .catch(error => {
                    this.setError(error);
                });
        },
        deleteCampaign(campaign) {
            axios.delete(`/api/campaigns/${campaign.id}`).then(() => {
                this.refresh();
                this.hover = false;
            });
        },
        leaveCampaign(campaign) {
            axios.put(`/api/campaigns/${campaign.id}/leave`).then(() => {
                this.refresh();
                this.hover = false;
            });
        },
    },
};
</script>
<style lang="scss" scoped>
#campaign-list {
    padding-top: 8em;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(325px, 500px));
    gap: 2vw;
    // centres each campaign in the grid cell
    justify-items: center;
    // centres the whole grid in the outer view
    justify-content: center;
}
</style>
