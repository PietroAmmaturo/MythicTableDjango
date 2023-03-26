import Vue from 'vue';
import jsonpatch from 'fast-json-patch';

import Entity from '@/core/entity/Entity';

const EntityStore = {
    namespaced: true,
    state: {},
    getters: {
        getEntityByRef: state => (ref, base) => {
            if (base == undefined) {
                if (ref === '.') {
                    if (process.env.NODE_ENV !== 'production') {
                        console.warn('getEntityByRef: cannot resolve self-pointer with no base');
                    }
                    return undefined;
                }
                return state[ref];
            }
            if (typeof base === 'string') {
                base = state[base];
            }
            return ref === '.' ? base : state[ref];
        },
        tokens(state) {
            return Object.values(state).filter(entity => entity.token);
        },
    },
    mutations: {
        patch(state, delta) {
            const entity = state[delta.id];
            jsonpatch.applyPatch(entity, delta.patch);
        },
        update(state, value) {
            const mergeObj = (dest, src) => {
                for (const prop in src) {
                    // If property exists in destination, if the new value
                    // is an object, merge; otherwise, overwrite.
                    if (dest.hasOwnProperty(prop)) {
                        if (typeof dest[prop] === 'object') {
                            mergeObj(dest[prop], src[prop]);
                        } else {
                            dest[prop] = src[prop];
                        }
                    } else {
                        Vue.set(dest, prop, src[prop]);
                    }
                }
            };

            mergeObj(state[value.id], value);
        },
        add(state, entity) {
            Vue.set(state, entity.id, entity);
        },
        delete(state, characterId) {
            Vue.delete(state, characterId);
        },
    },
    actions: {
        patch({ commit, state }, delta) {
            const id = delta.id;
            const patch = delta.patch;
            let entity = state[id];

            if (!entity) {
                entity = {};
                jsonpatch.applyPatch(entity, patch);
                commit('add', entity);
            } else {
                commit('patch', { id, patch });
            }
        },
        update({ commit, state }, payload) {
            if (state[payload.id]) {
                payload.value.id = payload.id;
                commit('update', payload.value);
            } else {
                commit('add', payload.value);
            }
        },
        async load({ commit }, entities) {
            for (const id in entities) {
                commit('add', new Entity(entities[id]));
            }
        },
        remove({ commit }, characterId) {
            commit('delete', characterId);
        },
    },
};

export default EntityStore;
