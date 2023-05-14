import Vue from 'vue';
import jsonpatch from 'fast-json-patch';
import { getByCampaign } from './api';
import { COLLECTION_TYPES } from './constants';
import Asset from '@/core/entity/Asset';

function getCollection(state, collection) {
    if (state.hasOwnProperty(collection)) {
        return state[collection];
    }
    return [];
}

function getItem(state, collection, id) {
    const c = getCollection(state, collection);
    if (c.hasOwnProperty(id)) {
        return c[id];
    }
    return null;
}

async function loadCollection(commit, rootState, collection) {
    const results = await getByCampaign(collection, rootState.live.sessionId);
    for (const i in results) {
        commit('add', { collection, item: results[i] });
    }
    return results;
}

const CollectionStore = {
    namespaced: true,
    state: {},
    getters: {
        getItem: state => (collection, id) => {
            return getItem(state, collection, id);
        },
        getCollection: state => collection => {
            return getCollection(state, collection);
        },
        maps: state => () => {
            return getCollection(state, COLLECTION_TYPES.maps);
        },
    },
    mutations: {
        patch(state, { collection, id, patch: patches }) {
            const item = getItem(state, collection, id);

            // Setting the specific property to track MUST be done before the property exists to add reactivity.
            patches = patches.reduce((nonAddPatches, patch) => {
                if (patch.op === 'add') {
                    const path = patch.path.split('/');
                    path.shift();
                    const addReactivityToThisProperty = path.pop();
                    const existingItemPath = path.reduce((item, pathPoint) => item[pathPoint], item);
                    Vue.set(existingItemPath, addReactivityToThisProperty, patch.value);
                } else {
                    nonAddPatches.push(patch);
                }
                return nonAddPatches;
            }, []);

            jsonpatch.applyPatch(item, patches);
        },
        forceReactivityUpdate(state, { collection, item }) {
            if (!state.hasOwnProperty(collection)) {
                Vue.set(state, collection, {});
            }
            Vue.set(state[collection], item._id, item);
        },
        add(state, { collection, item }) {
            if (!state.hasOwnProperty(collection)) {
                Vue.set(state, collection, {});
            }
            Vue.set(state[collection], item._id, item);
        },
        remove(state, { collection, id }) {
            if (state.hasOwnProperty(collection)) {
                Vue.delete(state[collection], id);
            }
        },
        purge(state) {
            for (let collection in state) {
                Vue.delete(state, collection);
            }
        },
    },
    actions: {
        async update({ dispatch }, { collection, id, patch }) {
            return await dispatch('live/updateCampaignObject', { collection, id, patch }, { root: true });
        },
        async add({ dispatch }, { collection, item }) {
            return await dispatch('live/addCampaignObject', { collection, item }, { root: true });
        },
        async remove({ dispatch }, { collection, id }) {
            return await dispatch('live/removeCampaignObject', { collection, id }, { root: true });
        },
        async load({ commit, rootState }, { collection }) {
            return await loadCollection(commit, rootState, collection);
        },

        async onAdded({ commit, dispatch }, { collection, item }) {
            commit('add', { collection, item });
            if (collection == COLLECTION_TYPES.maps) {
                await Asset.updateAll(item.stage.elements.map(e => e.asset));
                const player = await dispatch('players/findPlayerFromProfileId', item._userid, { root: true });
                dispatch('players/changePlayerMap', { mapId: item._id, player }, { root: true });
            }
        },
        async onRemoved({ commit }, { collection, id }) {
            commit('remove', { collection, id });
        },
        async onUpdated({ commit, state }, parameters) {
            console.log(parameters)
            commit('patch', parameters);
            if (parameters.collection == COLLECTION_TYPES.maps) {
                const item = getItem(state, parameters.collection, parameters.id);
                await Asset.updateAll(item.stage.elements.map(e => e.asset));
            }
        },
        async onLoad({ commit }, { collection, items }) {
            for (const i in items) {
                commit('add', { collection, item: items[i] });
            }
        },

        async loadMaps({ commit, rootState }) {
            return await loadCollection(commit, rootState, COLLECTION_TYPES.maps);
        },
        async reload({ state, commit, rootState }) {
            let collections = Object.keys(state);
            commit('purge');
            for (const i in collections) {
                await loadCollection(commit, rootState, collections[i]);
            }
        },
    },
};

export default CollectionStore;
