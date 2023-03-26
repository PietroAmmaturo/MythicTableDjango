<template>
    <div class="info-card-contents">
        <img src="/static/icons/layout/exit.svg" class="dismiss" @click="closeWindow" />
        <div id="name">{{ campaign.name }}</div>
        <div id="owner">{{ campaign.owner }}</div>
        <div id="description">{{ campaign.description }}</div>
        <span id="invitation-header" v-if="campaign.joinId">Invite Players:</span>
        <div id="invitation-container" v-if="campaign.joinId">
            <div id="id">{{ prettyJoinId }}</div>
            <div
                id="copy-link-button"
                v-tooltip="clipboardTooltipOptions"
                @click="copyToClipboard"
                :class="{ copied: clipboardCopied }"
            >
                <transition name="slide-left" mode="out-in">
                    <img :src="clipboardLinkImg" :key="clipboardLinkImg" />
                </transition>
            </div>
        </div>
        <div class="action-buttons">
            <button class="modal-button selected" @click="playCampaign">Play</button>
            <button class="modal-button" @click="editCampaign">Edit</button>
            <button class="modal-button accent-red" id="delete" @click="deleteCampaign" v-if="isOwned">
                <img src="/static/icons/layout/delete.svg" />
            </button>
            <button class="modal-button accent-red" id="leave" @click="leaveCampaign" v-else>
                Leave
            </button>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex';
export default {
    props: {
        campaign: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            clipboardTooltipOptions: {
                content: 'Copy Link',
                offset: '3px',
                hideOnTargetClick: false,
            },
            clipboardLinkImg: '/static/icons/layout/link.svg',
            clipboardCopied: false,
        };
    },
    computed: {
        ...mapGetters('profile', {
            getImage: 'getImage',
            getProfile: 'getProfile',
        }),
        ...mapState('profile', {
            me: 'me',
        }),
        ownerName() {
            return this.getProfile(this.campaign.owner).displayName;
        },
        prettyJoinId() {
            let id = this.campaign.joinId;
            //takes 6 digit id of xxxxxx and turns it into xxx-xxx
            return id.slice(0, 3) + '-' + id.slice(3);
        },
        isOwned() {
            return this.me.id === this.campaign.owner;
        },
    },
    created: async function() {
        if (!this.getProfile(this.campaign.owner)) {
            await this.loadProfile(this.campaign.owner);
        }
    },
    methods: {
        ...mapActions('profile', {
            loadProfile: 'load',
        }),
        playCampaign() {
            this.$router.push({ name: 'live-play', params: { sessionId: this.campaign.id, mapId: 'debug' } });
        },
        editCampaign() {
            this.$router.push({ path: `/edit/${this.campaign.id}` });
        },
        deleteCampaign() {
            this.$emit('delete-campaign');
        },
        leaveCampaign() {
            this.$emit('leave-campaign');
        },
        closeWindow() {
            this.resetClipboardButton();
            this.$emit('dismiss');
        },
        copyToClipboard() {
            this.$clipboard(`${window.location.origin}/invite/${this.campaign.joinId}`);
            this.clipboardLinkImg = '/static/icons/layout/check.svg';
            this.clipboardCopied = true;
            this.clipboardTooltipOptions.content = 'Copied!';
        },
        resetClipboardButton() {
            this.clipboardLinkImg = '/static/icons/layout/link.svg';
            this.clipboardCopied = false;
            this.clipboardTooltipOptions.content = 'Copy Link';
        },
    },
};
</script>

<style lang="scss" scoped>
.info-card-contents {
    width: 100%;
    height: 100%;
    position: relative;
    padding: 2em;
    display: grid;
    grid-template-rows: 3em 20px 1fr 1em 3em 60px;
    row-gap: 10px;
    .dismiss {
        width: 3em;
        position: absolute;
        top: 1.25em;
        right: 1.25em;
        cursor: pointer;
        &:hover {
            opacity: 0.8;
        }
        &:active {
            opacity: 0.6;
        }
    }
}
#name {
    height: 100%;
    font-weight: 700;
    font-size: 30px;
    margin: 10px 3px 20px 3px;
    padding-right: 2ch;
    line-height: normal !important;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
#owner {
    font-weight: 300;
    font-size: 1.4em;
    color: rgb(161, 161, 161);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
#description {
    font-size: 18px;
    margin-top: 1em;
    line-height: 1.25em;
    grid-row: 3;
    overflow: hidden;
    text-align: justify;
}
#invitation-header {
    margin-left: 10px;
    font-size: 15px;
    color: #949494;
    font-weight: 400;
}
#invitation-container {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 3em;
    align-items: center;
    border-radius: 10px;
    background: #444545;
    justify-items: center;
    overflow: hidden;

    #id {
        width: 100%;
        padding: 0px 10px;
        white-space: nowrap;
        text-overflow: ellipsis;
        font-size: 18px;
        font-weight: 300;
        overflow: hidden;
        text-align: center;
        letter-spacing: 0.5ch;
    }

    #copy-link-button {
        height: 100%;
        width: 100%;
        background: #313131;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        overflow: hidden;
        transition: background 0.2s;
    }
    #copy-link-button:hover {
        background: #585858;
    }
    #copy-link-button.copied {
        background: #1ba73e;
    }
}
//clipboard copy transition
.slide-left-leave-active,
.slide-left-enter-active {
    transition: 0.2s ease;
}
.slide-left-enter {
    transform: translate(3em, 0);
}
.slide-left-leave {
    transform: translate(0, 0);
}
.slide-left-leave-to {
    transform: translate(-3em, 0);
}
.modal-button {
    width: auto;
    padding: 0px 30px;
    margin: 3px 5px;
}
.modal-button.selected {
    padding: 0px 50px;
}
#delete {
    width: auto;
    padding: 0px 10px;
}
#delete img {
    height: 1em;
    width: 1em;
    margin-bottom: 2px;
}
</style>
