<template>
    <div class="map" :id="map._id" :class="{ selected: selected, private: map.private }">
        <img
            :id="map._id"
            class="background"
            :src="representativeMapImage"
            v-bind:class="{ selected: selected }"
            @click="onClick"
        />
        <div class="information-overlay">
            <div id="map-name">{{ map.name }}</div>
            <div class="buttons">
                <div class="moveAll" @click="onMoveAll" v-if="hasPermissionFor('moveAll', map['_userid'])">
                    <img src="/static/icons/maps/people.svg" />
                    Move all
                </div>
                <div class="edit" @click="edit">
                    <img src="/static/icons/maps/edit.svg" v-if="hasPermissionFor('editAnyMap', map['_userid'])" />
                    <img src="/static/icons/layout/info.svg" v-else />
                </div>
            </div>
            <div class="playerlist">
                <img
                    class="profile-image-adjustments"
                    :src="getImage(player.userId)"
                    v-for="player in playersInThisMap"
                    v-bind:key="player.userId"
                />
            </div>
            <img
                src="/static/icons/layout/invisible.svg"
                class="privacy-indicator"
                v-if="map.private"
                v-bind:class="{ selected: selected }"
            />
        </div>
    </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
export default {
    props: {
        map: {
            type: Object,
            default: function() {
                return {
                    _id: 'default',
                    stage: {
                        elements: [],
                    },
                };
            },
        },
        selected: Boolean,
    },
    computed: {
        ...mapState('collections', {
            players: 'players',
        }),
        ...mapGetters('profile', {
            getImage: 'getImage',
        }),
        ...mapGetters('hasPermission', {
            hasPermissionFor: 'hasPermissionFor',
        }),
        representativeMapImage() {
            return this.map.stage.elements?.[0]?.asset?.src ?? '/static/assets/campaigns/default.jpg';
        },
        playersInThisMap: function() {
            if (!this.players) {
                return [];
            }
            let players = Object.values(this.players).filter(p => p['mapId'] === this.map._id);
            //if there are more than 10 players, return first 10
            if (players.length > 10) {
                players = players.slice(0, 9);
            }
            return players;
        },
        playersInThisMapPreview: function() {
            const players = this.playersInThisMap;
            return Object.values(players)
                .map(p => p['userId'])
                .join('\n');
        },
    },
    methods: {
        onClick: function() {
            this.$emit('onSelect', { map: this.$props.map, component: this });
        },
        edit: function() {
            this.$emit('onEdit', { map: this.$props.map });
        },
        onMoveAll: function() {
            this.$emit('onMoveAll', { map: this.$props.map });
        },
    },
};
</script>

<style lang="scss" scoped>
.map {
    width: 100%;
    height: 150px;
    margin: 1em 0px;
    position: relative;
    border-radius: 1em;
    overflow: hidden;
    transition: border-left 0.25s ease;
    border-left: 1em #002e3d solid;
    &.selected {
        border-left: 1em #21a0a0 solid;
        box-shadow: 0 0 1em #21a0a08f;
    }
    &.private {
        border-left: 1em #8b2635 solid;
    }
    &.private.selected {
        border-left: 1em #c02d0c solid;
        box-shadow: 0 0 1em #c02d0c8f;
    }

    img.background {
        width: 100%;
        height: 100%;

        object-fit: cover;
        position: absolute;
        z-index: 1;
        opacity: 0.4;
        transition: opacity 0.2s;
        cursor: pointer;
        filter: saturate(0.25);
        &:hover {
            opacity: 0.7;
            filter: saturate(0.5);
        }
        &.selected {
            opacity: 1;
            filter: saturate(1);
        }
    }
}

.buttons {
    position: absolute;
    bottom: 10px;
    right: 15px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    pointer-events: all;
    align-self: flex-end;
    div {
        background: #1c1c1cc0;
        border-radius: 8px;
        padding: 5px 10px;
        display: flex;
        flex-direction: row;
        align-items: center;
        margin: 0px 2px;
        user-select: none;
        cursor: pointer;
        &:hover {
            background: #1c1c1cd7;
        }
    }
    img {
        height: 20px;
        width: 20px;
        z-index: 1000;
        position: relative;
        opacity: 1;
        margin-right: 5px;
    }
    .edit img {
        margin: 0px;
    }
}
.information-overlay {
    position: relative;
    z-index: 3 !important;
    width: 100%;
    height: 100%;

    transition: background 0.5s;
    padding: 5px 15px;
    pointer-events: none;

    #map-name {
        max-width: 80%;
        margin-top: 0.2em;
        font-size: 25px;
        line-height: 1.25em;
        user-select: none;
        text-shadow: 0 0 10px #000000;
        white-space: nowrap;
        overflow-x: hidden;
        text-overflow: ellipsis;
    }
    .playerlist {
        position: absolute;
        height: 10px;
        bottom: 30px;
        left: 10px;
        img {
            height: 30px;
            width: 30px;
            position: relative;
            opacity: 1;
            margin-left: -15px;
        }
        img:first-child {
            margin-left: 0px;
        }
    }
}

.privacy-indicator {
    height: 35px;
    width: 35px;
    position: absolute;
    top: 10px;
    right: 15px;
    background: #8b2635;
    padding: 7px;
    border-radius: 5px 5px 5px 5px;
    &.selected {
        background: #c02d0c;
    }
}
</style>
