// Module for representing gamestate in Vuex
// The base gamestate is the state of all objects in the game at a certain snapshot

import EntityStore from './EntityStore';
import Vue from 'vue';
import jsonpatch from 'fast-json-patch';
import _ from 'lodash';

// Invariant: gamestate = foldl(base, applyDeltas, deltas)
let GameStateStore = {
    namespaced: true,
    state: {
        base: {
            global: {},
            entities: {},
            ruleset: {},
        },
        global: {
            rollLog: [],
        },
        ruleset: {},
        selectedTokenId: '',
        activeMap: null,
        mapShapes: [],
    },
    modules: {
        entities: EntityStore,
    },
    getters: {
        base: state => {
            return state.base;
        },
        ruleset: state => {
            return state.ruleset;
        },
        actions: state => {
            return state.ruleset.actions;
        },
        rollLog: state => {
            return state.global.rollLog;
        },
        selectedTokenId: state => {
            return state.selectedTokenId;
        },
    },
    mutations: {
        selectedTokenUpdate(state, tokenId) {
            state.selectedTokenId = tokenId;
        },
        setMapShapes(state, shapes) {
            state.mapShapes = shapes;
        },
    },
    actions: {
        clear({ state }) {
            Vue.set(state, 'entities', {});
            Vue.set(state, 'global', { rollLog: [] });
        },
        setBase({ state }) {
            Vue.set(state.base, 'entities', _.cloneDeep(state.entities));
            Vue.set(state.base, 'global', _.cloneDeep(state.global));
            Vue.set(state.base, 'ruleset', _.cloneDeep(state.ruleset));
        },
        activateMap({ state }, map) {
            Vue.set(state, 'activeMap', map);
        },
        // TODO - Delete this
        applyDelta({ dispatch }, delta) {
            if (!Array.isArray(delta)) delta = [delta];

            delta.forEach(patch => {
                dispatch('patch', patch);
            });
        },

        // Patch is a list of JSON patch operations as described in: http://jsonpatch.com/
        // IMPORTANT POINT TO NOTE: Vue cannot detect property addition or deletion.
        // What needs to be done is check if an operation is anything else than a "replace"
        // And depending on that, handle the Vue reactivity stuff when applying the patch.
        patch({ state }, patch) {
            if (!Array.isArray(patch)) patch = [patch];
            if (patch.length == 0) return;

            // Dry run the JSONpatch to allow for aborting
            // If this throws an error, the patch is not applied
            jsonpatch.applyPatch(state, patch, true, false).pop().newDocument;

            // Execute the patch with appropriate vue operations when needed
            patch.forEach(change => {
                const followPath = path => {
                    return path.reduce((acc, el) => {
                        return acc[el];
                    }, state);
                };

                const parsePath = pathString => {
                    const path = pathString.split('/');
                    path.shift(); // remove the first, empty element

                    if (path[0] != 'entities' && path[0] != 'global')
                        throw new Error('Attempted to touch protected property: ' + path[0]);

                    // Handle JSONPatch syntactic sugar
                    path.forEach((el, idx) => {
                        switch (el) {
                            case '-':
                                path[idx] = followPath(path.slice(0, idx)).length;
                                break;
                        }
                    });
                    return path;
                };

                const path = parsePath(change.path);

                switch (change.op) {
                    case 'replace':
                        jsonpatch.applyPatch(state, [change]);
                        break;
                    case 'add': {
                        let prop = path.pop();
                        if (Array.isArray(followPath(path))) {
                            followPath(path).splice(prop, 0, change.value); // Insert the value at the given index
                        } else {
                            Vue.set(followPath(path), prop, change.value);
                        }
                        break;
                    }
                    case 'remove': {
                        let prop = path.pop();

                        if (prop in state) throw new Error('Attempted to remove protected property: ' + prop);
                        Vue.delete(followPath(path), prop);
                        break;
                    }
                    case 'move': {
                        const from = parsePath(change.from);
                        const moved = _.cloneDeep(followPath(from));

                        const fromProp = from.pop();

                        if (fromProp in state) throw new Error('Attempted to remove protected property: ' + prop);
                        Vue.delete(followPath(from), fromProp);

                        let prop = path.pop();
                        Vue.set(followPath(path), prop, moved);
                        break;
                    }
                    case 'copy': {
                        const from = parsePath(change.from);
                        const copied = _.cloneDeep(followPath(from));

                        let prop = path.pop();
                        Vue.set(followPath(path), prop, copied);
                        break;
                    }
                    case 'test':
                        // This one is already handled by the dry run. It does not change anything to the state
                        break;
                }
            });
        },
    },
};

export default GameStateStore;
