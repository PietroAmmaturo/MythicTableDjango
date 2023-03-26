<template>
    <BaseModal v-if="displayModal" @escape="closeGmControls">
        <section>
            <h5>Game Master Controls</h5>

            <h6>Game Master(s)</h6>
            <ul>
                <li v-for="profile in gmProfiles" :key="profile.id" class="gm-display user-display">
                    <img :src="profile.imageUrl" :alt="`Profile image of ${profile.displayName}.`" />
                    <p>{{ profile.displayName }}</p>
                    <button
                        v-if="hasMoreThanOneGm"
                        :disabled="!isGameMasterOrCampaignOwner"
                        @click="() => setGameMasterStatus({ profileId: profile.id, isGameMaster: false })"
                    >
                        <img src="/static/icons/layout/back.svg" alt="Arrow, click to add to players." />
                    </button>
                </li>
            </ul>

            <h6>Player(s)</h6>
            <ul>
                <li v-for="profile in nonGmProfiles" :key="profile.id" class="player-display user-display">
                    <img
                        :src="profile.imageUrl"
                        :alt="`Profile image of ${profile.displayName}.`"
                        :title="profile.displayName"
                    />
                    <p :title="profile.displayName">{{ profile.displayName }}</p>
                    <button
                        v-show="isCampaignOwner && !isCampaignOwnerById(profile.id)"
                        @click="() => leaveCampaign(profile.id)"
                    >
                        <img src="/static/icons/layout/delete.svg" alt="Trash, click to remove player from game." />
                    </button>
                    <button
                        :disabled="!isGameMasterOrCampaignOwner"
                        @click="() => setGameMasterStatus({ profileId: profile.id, isGameMaster: true })"
                    >
                        <img src="/static/icons/layout/back.svg" alt="Arrow, click to add to game masters." />
                    </button>
                </li>
            </ul>

            <h6>Game Master Only Permissions</h6>
            <ul>
                <li>
                    <p>Assumed Permissions</p>
                    <figure>
                        <img src="/static/icons/layout/info.svg" alt="Hover for more information." />
                        <figcaption>
                            Game master(s) are assumed to always be able to delete any token on the map and edit any
                            map.
                        </figcaption>
                    </figure>
                </li>
                <li>
                    <Toggle
                        elementId="gm-grid"
                        :checked="settings.gridControl"
                        :toggleChecked="() => updateSetting('gridControl')"
                        :isDisabled="!isGameMaster"
                        checkedColor="#615FD4"
                    />
                    <label for="gm-grid">Control Grid Experience</label>
                    <figure>
                        <img src="/static/icons/layout/info.svg" alt="Hover for more information." />
                        <figcaption>
                            Enable this option to give game master(s) the exclusive ability to manipulate grid controls.
                            If it is not enabled, control will be given to the map’s creator.
                        </figcaption>
                    </figure>
                </li>
                <li>
                    <Toggle
                        elementId="gm-fog"
                        :checked="settings.fogControl"
                        :toggleChecked="() => updateSetting('fogControl')"
                        :isDisabled="!isGameMaster"
                        checkedColor="#615FD4"
                    />
                    <label for="gm-fog">Control Fog of War</label>
                    <figure>
                        <img src="/static/icons/layout/info.svg" alt="Hover for more information." />
                        <figcaption>
                            Enable this option to give game master(s) the exclusive ability to manipulate the Fog of
                            War. If it is not enabled, control will be given to the map’s creator.
                        </figcaption>
                    </figure>
                </li>
                <li>
                    <Toggle
                        elementId="gm-hidden-tokens"
                        :checked="settings.hiddenTokens"
                        :toggleChecked="() => updateSetting('hiddenTokens')"
                        :isDisabled="!isGameMaster"
                        checkedColor="#615FD4"
                    />
                    <label for="gm-hidden-tokens">View Hidden Tokens</label>
                    <figure>
                        <img src="/static/icons/layout/info.svg" alt="Hover for more information." />
                        <figcaption>
                            Enable this option to give game master(s) the ability to see tokens which have been made
                            invisible by any user. If it is not enabled only the owner of the token will be able to see
                            it. This does not reveal private tokens in the token library.
                        </figcaption>
                    </figure>
                </li>
                <li>
                    <Toggle
                        elementId="gm-move-all"
                        :checked="settings.moveAll"
                        :toggleChecked="() => updateSetting('moveAll')"
                        :isDisabled="!isGameMaster"
                        checkedColor="#615FD4"
                    />
                    <label for="gm-move-all">Move All option</label>
                    <figure>
                        <img src="/static/icons/layout/info.svg" alt="Hover for more information." />
                        <figcaption>
                            Enable this option to give game master(s) the exclusive ability to move all players from one
                            map to another simultaneously. If it is not enabled, map’s creator will be the only one who
                            can move all to their repective maps.
                        </figcaption>
                    </figure>
                </li>
            </ul>

            <button id="close" @click="closeGmControls">Close</button>
        </section>
    </BaseModal>
</template>

<script>
import { mapGetters, mapState, mapMutations, mapActions } from 'vuex';
import _ from 'lodash';
import axios from 'axios';

import BaseModal from '@/core/components/BaseModal.vue';
import Toggle from '@/core/components/ToggleSwitch.vue';

export default {
    components: {
        BaseModal,
        Toggle,
    },
    computed: {
        ...mapState('gmPermissions', {
            displayModal: 'displayGmControlsModal',
        }),
        ...mapState('profile', {
            me: 'me',
            profiles: 'profiles',
        }),
        ...mapState('live', {
            connected: 'connected',
        }),
        ...mapState('campaigns', {
            activeCampaign: 'activeCampaign',
        }),
        ...mapGetters('gmPermissions', {
            settings: 'permissionSettings',
        }),
        ...mapGetters('players', {
            gameMasters: 'gameMasters',
            nonGameMasters: 'nonGameMasters',
            players: 'getPlayers',
        }),
        ...mapGetters('hasPermission', {
            isCampaignOwner: 'isCampaignOwner',
            isCampaignOwnerById: 'isCampaignOwnerById',
            isGameMaster: 'getGameMasterStatus',
        }),
        ...mapGetters('profile', {
            getProfile: 'getProfile',
        }),
        gmProfiles() {
            this.profiles;
            const gmProfiles = this.getProfilesFor(this.gameMasters);
            return this.withoutNullPropertiesFrom(gmProfiles);
        },
        nonGmProfiles() {
            this.profiles;
            const nonGmProfiles = this.getProfilesFor(this.nonGameMasters);
            return this.withoutNullPropertiesFrom(nonGmProfiles);
        },
        isGameMasterOrCampaignOwner() {
            return this.isCampaignOwner || this.isGameMaster;
        },
        hasMoreThanOneGm() {
            return _.size(this.gmProfiles) > 1;
        },
    },
    watch: {
        displayModal() {
            const foundProfilesCount = _.size(this.gmProfiles) + _.size(this.nonGmProfiles);
            const expectedCount = _.size(this.players);
            if (foundProfilesCount !== expectedCount) {
                this.loadProfiles(_.map(this.players, player => player.userId));
            }
        },
        players() {
            // First time user joins they do not exist as a player for a short amount of time.
            setTimeout(() => {
                const userInPlayers = _.find(this.players, player => player.userId === this.me.id);
                if (!userInPlayers && !_.isEmpty(this.players)) {
                    this.$router.push({ path: '/campaign-list' });
                }
            }, 2000);
        },
    },
    methods: {
        ...mapMutations('gmPermissions', {
            closeGmControls: 'toggleDisplayGmControlsModal',
        }),
        ...mapActions('gmPermissions', {
            updateSetting: 'setGmPermissionSetting',
        }),
        ...mapActions('players', {
            setGameMasterStatus: 'setGameMasterStatus',
            removePlayer: 'remove',
        }),
        ...mapActions('profile', {
            loadProfiles: 'loadMultiple',
        }),
        getProfilesFor(users) {
            return _.map(users, userId => this.getProfile(userId));
        },
        withoutNullPropertiesFrom(list) {
            return _.without(list, null);
        },
        leaveCampaign(profileId) {
            const player = _.find(this.players, player => player.userId === profileId);
            this.removePlayer(player._id);
            axios.put(`/api/campaigns/${this.activeCampaign.id}/forceLeave/${profileId}`);
        },
    },
};
</script>

<style lang="scss" scoped>
section {
    display: grid;
    grid-template-columns: 31% 31% 34%;
    column-gap: 2%;
    grid-template-rows: 6% 5% 76% 7%;
    row-gap: 2%;
    width: 100%;
    min-height: 500px;
    padding: 30px;
}
ul {
    min-height: 95px;
    margin: 0 0 0 0;
    padding: 10px 10px 10px 10px;
    list-style-type: none;
    background-color: #444;
    border-radius: 8px;
}
figure {
    margin: 0 0 0 0;
}
img {
    width: 30px;
    height: 30px;
    border-radius: 50%;
}
h5 {
    grid-column: 1 / span 1;
    grid-row: 1 / span 1;
    margin: 0 0 0 0;
    font-size: 1.4rem;
}
h6 {
    margin: 0 0 0 0;
    font-size: 1.1rem;
}
h6:first-of-type {
    grid-column: 1 / span 1;
    grid-row: 2 / span 1;
}
h6:nth-of-type(2) {
    grid-column: 2 / span 1;
    grid-row: 2 / span 1;
}
h6:nth-of-type(3) {
    grid-column: 3 / span 1;
    grid-row: 2 / span 1;
}
ul:first-of-type {
    grid-column: 1 / span 1;
    grid-row: 3 / span 2;
}
ul:nth-of-type(2) {
    grid-column: 2 / span 1;
    grid-row: 3 / span 2;
}
ul:nth-of-type(3) {
    grid-column: 3 / span 1;
    grid-row: 3 / span 1;
    background-color: #31313a;
    li {
        display: grid;
        position: relative;
        grid-template-columns: 16% 64% 16%;
        column-gap: 2%;
        padding: 15px 0 15px 0;
        border-bottom: 1px solid #ffffff40;
        label {
            margin: 0 0 0 0;
            cursor: pointer;
            grid-column: 2;
            grid-row: 1;
        }
        p {
            margin: 0 0 0 0;
            grid-column: 2;
            grid-row: 1;
        }
        ::v-deep .toggle {
            grid-column: 3;
            grid-row: 1;
            width: 40px;
            height: 20px;
        }
        figure {
            place-self: center;
        }
        img {
            width: 20px;
            height: 20px;
            opacity: 0.5;
        }
        figcaption {
            display: none;
        }
        figure:hover > figcaption {
            display: flex;
            position: absolute;
            top: 110%;
            left: -5%;
            z-index: 1;
            width: 110%;
            padding: 8px;
            font-weight: 600;
            line-height: 150%;
            background-color: #17171ccc;
            backdrop-filter: blur(5px);
            border-radius: 10px;
        }
    }
}
.user-display {
    position: relative;
    display: grid;
    column-gap: 2%;
    width: 100%;
    margin: 0 0 0 0;
    padding: 5px 5px 5px 5px;
    border-bottom: 1px #31313a solid;
    img {
        place-self: center;
    }
    p {
        margin: 0 0 0 3px;
        align-self: center;
        font-size: 0.9rem;
        font-weight: 600;
    }
    button {
        place-self: center;
        margin: 0 0 0 0;
        padding: 0 2px 0 2px;
        background-color: #31313a00;
        border-radius: 50%;
    }
    button:disabled {
        opacity: 0.1;
        background: none !important;
        border-width: 0 !important;
    }
}
.user-display:last-of-type {
    border-bottom: none;
}
.gm-display {
    grid-template-columns: 17% auto 14%;
}
.player-display {
    grid-template-columns: 14% 17% auto 14%;
    button:last-of-type {
        grid-column: 1;
        grid-row: 1;
    }
    img {
        grid-column: 2;
    }
    p {
        grid-column: 3;
        text-overflow: ellipsis;
        overflow: hidden;
    }
    button:first-of-type {
        grid-column: 4;
        padding: 0 9px 0 9px;
    }
}
#close {
    grid-column: 3 / span 1;
    grid-row: 4 / span 1;
    justify-self: end;
    width: 70%;
    padding: 5px 20px 5px 20px;
    background-color: #444;
}
</style>
