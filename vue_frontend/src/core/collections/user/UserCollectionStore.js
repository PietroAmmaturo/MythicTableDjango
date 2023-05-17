import Vue from 'vue';
import jsonpatch from 'fast-json-patch';
import { get, post, put } from './api';

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

const UserCollectionStore = {
    namespaced: true,
    state: {},
    getters: {
        getItem: state => (collection, id) => {
            return getItem(state, collection, id);
        },
        getCollection: state => collection => {
            return getCollection(state, collection);
        },
    },
    mutations: {
        patch(state, { collection, id, patch }) {
            const item = getItem(state, collection, id);
            jsonpatch.applyPatch(item, patch);
            if (patch.filter(p => p.op == 'add')) {
                Vue.delete(state[collection], id);
                Vue.set(state[collection], id, item);
            }
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
    },
    actions: {
        async update({ commit }, { collection, id, patch }) {
            const results = await put(collection, id, patch);
            commit('patch', { collection, id, patch });
            return results;
        },
        async add({ commit }, { collection, item }) {
            const results = await post(collection, item);
            commit('add', { collection, item });
            return results;
        },
        async load({ commit }, { collection }) {
            const results = await get(collection);
            for (const i in results) {
                commit('add', { collection, item: results[i] });
            }
            return results;
        },
    },
};

export default UserCollectionStore;
