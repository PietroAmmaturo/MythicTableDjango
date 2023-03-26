import { characters as defaultCharacters } from './defaultCharacterData';
import { addCharacter, getCharacters, addMap, getMaps } from '@/core/api/files/files.js';

const LibraryStore = {
    namespaced: true,
    state: {
        characters: defaultCharacters,
        maps: [],
    },
    mutations: {
        updateCharacters(state, characters) {
            state.characters = [...defaultCharacters, ...characters];
        },
        updateMaps(state, maps) {
            state.maps = maps;
        },
    },
    actions: {
        async addCharacter(_, event) {
            let files;
            files = event && event.target && event.target.files;
            return await addCharacter(files);
        },
        async getCharacters({ commit }) {
            commit('updateCharacters', await getCharacters());
        },
        // TODO - Consider refactoring away this duplication in addMap and getMaps
        async addMap({ dispatch }, event) {
            let files;
            files = event && event.target && event.target.files;
            await addMap(files)
                .then(() => {
                    dispatch('getMaps');
                })
                .catch(err => {
                    console.error(err);
                });
        },
        async getMaps({ commit }) {
            await getMaps().then(result => {
                commit('updateMaps', result);
            });
        },
    },
    getters: {
        characters: state => {
            return state.characters;
        },
    },
};

export default LibraryStore;
