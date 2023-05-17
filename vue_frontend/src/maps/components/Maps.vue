<template>
    <div class="maps">
        <MapList
            v-bind:maps="maps"
            v-bind:activeMap="activeMap"
            @onEdit="onEdit"
            @onSelected="onSelected"
            @onMoveAll="onMoveAll"
        />
    </div>
</template>

<script lang="ts">
import { mapActions, mapState } from 'vuex';

import MapList from './MapList.vue';

export default {
    components: {
        MapList: MapList,
    },
    data: function() {
        return {
            showEditor: false,
            title: 'Map Library',
            initializing: true,
        };
    },
    computed: {
        ...mapState('collections', {
            maps: 'maps',
            players: 'players',
        }),
        ...mapState('live', {
            campaignId: 'sessionId',
            connected: 'connected',
        }),
        ...mapState('gamestate', {
            activeMap: 'activeMap',
        }),
        ...mapState('profile', {
            me: 'me',
        }),
        player: function() {
            if (!this.players) {
                return null;
            }
            return Object.values(this.players).find(p => p['userId'] === this.me.id);
        },
    },
    watch: {
        campaignId: async function() {
            await this.setUpPlayer();
        },
        me: async function() {
            await this.setUpPlayer();
        },
        connected: async function() {
            await this.setUpPlayer();
        },
        players: {
            handler() {
                this.trackMap();
            },
            deep: true,
        },
        maps: function() {
            this.trackMap();
        },
        activeMap: function() {
            this.trackMap();
        },
    },
    mounted: async function() {
        await this.setUpPlayer();
    },
    methods: {
        ...mapActions('players', {
            loadPlayers: 'load',
            addPlayer: 'add',
            updatePlayer: 'update',
            changePlayerMap: 'changePlayerMap',
        }),
        setUpPlayer: async function() {
            if (this.connected && this.me.id && this.campaignId && !this.player) {
                const players = await this.loadPlayers();
                const player = Object.values(players).find(p => p['userId'] === this.me.id);
                if (!player) {
                    const p = { userId: this.me.id };
                    await this.addPlayer({ player: p });
                } else {
                    this.trackMap();
                }
            }
        },
        trackMap: function() {
            if (this.player && this.activeMap && this.maps) {
                if (this.player.mapId != this.activeMap._id) {
                    const map = this.maps[this.player.mapId];
                    if (map) {
                        this.$store.dispatch('gamestate/activateMap', map);
                    }
                }
                this.initializing = false;
            }
        },
        onEdit: function({ map }) {
            this.$emit('onEdit', { map });
        },
        onSelected: function({ map }) {
            this.changePlayerMap({ mapId: map._id, player: this.player });
        },
        onMoveAll: function({ map }) {
            Object.values(this.players).forEach(player => {
                this.changePlayerMap({ mapId: map._id, player });
            });
        },
    },
};
</script>
<style scoped>
.maps {
    width: 100%;
    display: flex;
    flex-direction: column;
    flex: 1;
}
</style>
