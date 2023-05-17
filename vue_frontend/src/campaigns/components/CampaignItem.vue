<template>
    <div class="campaign">
        <div class="info-card" :class="{ show: showCard }">
            <CampaignInfoCard
                :campaign="campaign"
                @dismiss="hideInfoCard"
                @delete-campaign="deleteCampaign"
                @leave-campaign="leaveCampaign"
            />
        </div>
        <div class="campaign-card" :style="{ 'background-image': 'url(' + campaign.imageUrl + ')' }">
            <div id="overlay" @click.self="campaignClick">
                <img src="/static/icons/layout/play.svg" @click.self="campaignClick" />
                <div class="info" @click="showInfoCard">
                    <img src="/static/icons/layout/info.svg" />
                    Info
                </div>
            </div>
        </div>
        <div class="campaign-name">{{ campaign.name }}</div>
    </div>
</template>

<script>
import CampaignInfoCard from './CampaignInfoCard';
export default {
    components: {
        CampaignInfoCard,
    },
    props: {
        campaign: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            showCard: false,
        };
    },
    methods: {
        campaignClick() {
            //hide the info card if it is being shown
            if (this.showCard) {
                this.hideInfoCard();
            } else {
                this.$store.dispatch('analytics/pushEvent', {
                    event: {
                        category: 'Campaign',
                        action: 'Play',
                        name: this.campaign.name,
                        value: this.campaign.players.length,
                    },
                });
                this.$router.push({ name: 'live-play', params: { sessionId: this.campaign.id, mapId: 'debug' } });
            }
        },
        showInfoCard() {
            this.showCard = true;
        },
        hideInfoCard() {
            this.showCard = false;
        },
        deleteCampaign() {
            this.$emit('delete-campaign', this.campaign);
        },
        leaveCampaign() {
            this.$emit('leave-campaign', this.campaign);
        },
    },
};
</script>
<style lang="scss">
$hover-transition-length: 0.5s;
.campaign {
    width: 25vw;
    min-width: 353px;
    max-width: 500px;
    display: flex;
    flex-direction: column;
    margin: 1em 3em;
    position: relative;
}
.campaign-card {
    position: relative;
    height: 35vw;
    min-height: 494px;
    max-height: 700px;
    background: #1c1c1c;
    border-radius: 3em;
    box-shadow: 0px 0px 50px #00000041;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    transition: all $hover-transition-length ease;
    cursor: pointer;
    overflow: hidden;
    #overlay {
        opacity: 0;
        width: 100%;
        height: 100%;
        background: #000000aa;
        display: flex;
        justify-content: center;
        align-content: center;
        transition: opacity $hover-transition-length;
        img {
            width: 30%;
        }
    }

    .info {
        font-size: 20px;
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        background: #1c1c1cab;
        border-top: #333 solid 2px;
        padding: 1.5em 0;
        cursor: pointer;
        user-select: none;
        text-align: center;
        transition: background 0.2s;
        img {
            height: 2em;
            width: 2em !important;
            padding: 0;
            margin-right: 0.25em;
            margin-top: -0.2em;
        }
        &:hover {
            background: #1c1c1cd3;
        }
    }
}
.campaign-card:hover {
    transform: scale(1.03);
    #overlay {
        opacity: 1;
    }
}
.info-card {
    position: absolute;
    bottom: -20px;

    height: 95%;
    width: 100%;
    border-radius: 3em;

    background: #1c1c1c;
    opacity: 0;
    z-index: 10;
    pointer-events: none;
    transition: all $hover-transition-length ease;
}
.info-card.show {
    bottom: 0px;
    pointer-events: all;
    opacity: 1;
}
.info-card.show ~ .campaign-card {
    transform: scale(0.9);
    filter: saturate(0.25) brightness(1.7);
    margin-top: -20px;
}
.info-card.show ~ .campaign-name {
    opacity: 0;
}
.campaign-name {
    text-align: center;
    font-size: 19px;
    padding-top: 1em;
    overflow-y: hidden;
    transition: all $hover-transition-length ease;
    user-select: none;
    line-height: normal !important;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 400;
}
</style>
