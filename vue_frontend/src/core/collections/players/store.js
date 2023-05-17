import _ from 'lodash';
import * as jsonPatch from 'fast-json-patch';

import { COLLECTION_TYPES } from '@/core/collections/constants';

export const getters = {
    getPlayer: (state, getters, rootState, rootGetters) => id => {
        return rootGetters['collections/getItem'](COLLECTION_TYPES.players, id);
    },
    getPlayers: (state, getters, rootState, rootGetters) => {
        return rootGetters['collections/getCollection'](COLLECTION_TYPES.players);
    },
    gameMasters(state, getters, rootState) {
        const players = getters.getPlayers;
        const gameMasters = createGmGroup(players);
        if (!_.isEmpty(gameMasters)) {
            return gameMasters;
        } else {
            const ownerId = rootState.campaigns.activeCampaign.owner;
            return { [ownerId]: ownerId };
        }
    },
    nonGameMasters(state, getters) {
        const players = getters.getPlayers;
        const nonGameMasters = createNonGmGroup(players, getters.gameMasters);
        return nonGameMasters;
    },
    isGameMaster: (state, getters) => userId => {
        return userId in getters.gameMasters;
    },
};

export const actions = {
    async add({ dispatch }, { player }) {
        return await dispatch(
            'collections/add',
            { collection: COLLECTION_TYPES.players, item: player },
            { root: true },
        );
    },
    async update({ dispatch }, { id, patch }) {
        return await dispatch(
            'collections/update',
            { collection: COLLECTION_TYPES.players, id, patch },
            { root: true },
        );
    },
    async remove({ dispatch }, playerId) {
        return await dispatch(
            'collections/remove',
            { collection: COLLECTION_TYPES.players, id: playerId },
            { root: true },
        );
    },
    async load({ dispatch }) {
        return await dispatch('collections/load', { collection: COLLECTION_TYPES.players }, { root: true });
    },
    async setGameMasterStatus({ dispatch }, { profileId, isGameMaster }) {
        const player = await dispatch('findPlayerFromProfileId', profileId);
        const editablePlayer = _.cloneDeep(player);
        editablePlayer.isGameMaster = isGameMaster;
        const patch = jsonPatch.compare(player, editablePlayer);
        if (patch.length > 0) {
            await dispatch('update', { id: player._id, patch });
        }
    },
    async changePlayerMap({ dispatch }, { mapId, player }) {
        await dispatch('setCurrentMapForPlayer', { mapId, player });
        const argumentFiller = {};
        dispatch('drawing/clearLines', argumentFiller, { root: true });
    },
    async setCurrentMapForPlayer({ dispatch }, { mapId, player }) {
        const modifiedPlayer = _.cloneDeep(player);
        modifiedPlayer.mapId = mapId;
        const patch = jsonPatch.compare(player, modifiedPlayer);
        if (patch.length > 0) {
            await dispatch('update', { id: player._id, patch });
        }
    },
    findPlayerFromProfileId({ getters }, profileId) {
        const players = getters.getPlayers;
        return _.find(players, player => player.userId === profileId);
    },
};

function createGmGroup(players) {
    return _.reduce(
        players,
        (gameMasters, player) => {
            if (player.isGameMaster) {
                gameMasters[player.userId] = player.userId;
            }
            return gameMasters;
        },
        {},
    );
}

function createNonGmGroup(players, assumedGameMasters) {
    return _.reduce(
        players,
        (nonGameMasters, player) => {
            if (!player.isGameMaster && !assumedGameMasters[player.userId]) {
                nonGameMasters[player.userId] = player.userId;
            }
            return nonGameMasters;
        },
        {},
    );
}

const PlayerStore = {
    namespaced: true,
    getters,
    actions,
};

export default PlayerStore;
