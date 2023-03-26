import { COLLECTION_TYPES } from '@/core/collections/constants';
import * as jsonpatch from 'fast-json-patch';
import Token from './model';

export const getters = {
    getRawToken: (state, getters, rootState, rootGetters) => id => {
        return rootGetters['collections/getItem'](COLLECTION_TYPES.tokens, id);
    },
    getToken: (state, getters, rootState, rootGetters) => id => {
        return new Token(rootGetters['collections/getItem'](COLLECTION_TYPES.tokens, id));
    },
    getTokens: (state, getters, rootState, rootGetters) => {
        return Object.values(rootGetters['collections/getCollection'](COLLECTION_TYPES.tokens)).map(
            token => new Token(token),
        );
    },
    getTokensByMapId: (state, getters, rootState, rootGetters) => mapId => {
        return Object.values(rootGetters['collections/getCollection'](COLLECTION_TYPES.tokens))
            .map(token => new Token(token))
            .filter(token => token.mapId === mapId);
    },
};

export const mutations = {
    updateSelectedToken(state, token) {
        state.selectedToken = token;
    },
};

export const actions = {
    async spawn({ dispatch }, token) {
        console.log("adding token")
        return await dispatch(
            'collections/add',
            { collection: COLLECTION_TYPES.tokens, item: new Token(token) },
            { root: true },
        );
    },
    /**
     *
     * @param {Vuex.context} param0
     * @param {Token} param1
     */
    async remove({ dispatch }, { id }) {
        console.log("removing token")
        if (id) {
            return await dispatch('collections/remove', { collection: COLLECTION_TYPES.tokens, id }, { root: true });
        }
    },
    /**
     *
     * @param {Vuex.context} context
     * @param {Token} editedToken
     */

    async update({ getters, dispatch }, editedToken) {
        console.log("updating token")
        const currentToken = getters.getRawToken(editedToken._id);
        if (!currentToken) throw new Error(`Could not find Token to update with id '${editedToken._id}'`);

        // Position is changed by moveToken, not update
        const changes = {
            ...editedToken,
            pos: currentToken.pos,
        };
        const patch = jsonpatch.compare(currentToken, new Token(changes));

        return await dispatch(
            'collections/update',
            { collection: COLLECTION_TYPES.tokens, id: editedToken._id, patch },
            { root: true },
        );
    },
    /**
     *
     * @param {Vuex.context} context
     * @param {Token} movedToken
     */
    async moveToken(context, movedToken) {
        console.log("moving token")
        const currentToken = new Token(
            context.rootGetters['collections/getItem'](COLLECTION_TYPES.tokens, movedToken._id),
        );
        if (!currentToken) throw new Error(`Could not find Token to update with id '${movedToken.id}'`);
        const patch = jsonpatch.compare({ pos: currentToken.pos }, { pos: movedToken.pos });

        if (patch.length) {
            return await context.dispatch(
                'collections/update',
                { collection: COLLECTION_TYPES.tokens, id: movedToken._id, patch },
                { root: true },
            );
        }
    },
    async load({ dispatch }) {
        return await dispatch('collections/load', { collection: COLLECTION_TYPES.tokens }, { root: true });
    },
};

const TokenStore = {
    namespaced: true,
    state: {
        selectedToken: {},
    },
    getters,
    mutations,
    actions,
};

export default TokenStore;
