import { COLLECTION_TYPES } from '@/core/collections/constants';
import * as jsonpatch from 'fast-json-patch';
import Character from '@/characters/models/model';

export const getters = {
    getRawCharacter: ({ rootGetters }) => id => {
        return rootGetters['collections/getItem'](COLLECTION_TYPES.characters, id);
    },
    getCharacter: ({ rootGetters }) => id => {
        return new Character(rootGetters['collections/getItem'](COLLECTION_TYPES.characters, id));
    },
    getCharacters: (state, getters, rootState, rootGetters) => {
        return Object.values(rootGetters['collections/getCollection'](COLLECTION_TYPES.characters)).map(
            character => new Character(character),
        );
    },
};

export const actions = {
    async add({ dispatch }, character) {
        return await dispatch(
            'collections/add',
            { collection: COLLECTION_TYPES.characters, item: character },
            { root: true },
        );
    },
    /**
     *
     * @param {Vuex.context} param0
     * @param {Character} param1
     */
    async remove({ dispatch }, { id }) {
        return await dispatch('collections/remove', { collection: COLLECTION_TYPES.characters, id }, { root: true });
    },
    /**
     *
     * @param {Vuex.context} context
     * @param {Character} editedCharacter
     */
    async update(context, editedCharacter) {
        const currentCharacter = getters.getRawCharacter(context)(editedCharacter._id);
        if (!currentCharacter) throw new Error(`Could not find character to update with id '${editedCharacter._id}'`);
        const patch = jsonpatch.compare(currentCharacter, new Character(editedCharacter));

        return await context.dispatch(
            'collections/update',
            { collection: COLLECTION_TYPES.characters, id: editedCharacter._id, patch },
            { root: true },
        );
    },
    async load({ dispatch }) {
        return await dispatch('collections/load', { collection: COLLECTION_TYPES.characters }, { root: true });
    },

    openEditor({ state }, character) {
        state.characterToEdit = character;
    },
    closeEditor({ state }) {
        state.characterToEdit = null;
    },
};

const CharacterStore = {
    namespaced: true,
    state: {
        characterToEdit: null,
    },
    getters,
    actions,
};

export default CharacterStore;
