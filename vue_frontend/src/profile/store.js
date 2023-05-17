import Vue from 'vue';
import ProfileApi from '@/profile/api';
import { addFile, FILE_TYPES } from '@/core/api/files/files.js';

const ProfileStore = {
    namespaced: true,
    state: {
        me: {},
        showEditor: false,
        profiles: {},
        profileLoadPromises: {},
    },
    getters: {
        getImage: state => id => {
            if (id == state.me.id) {
                return state.me.imageUrl;
            } else if (state.profiles.hasOwnProperty(id)) {
                return state.profiles[id].imageUrl;
            }
            return '/static/icons/layout/mythic_wolf.svg';
        },
        getProfile: state => id => {
            if (id == state.me.id) {
                return state.me;
            } else if (state.profiles.hasOwnProperty(id)) {
                return state.profiles[id];
            }
            return null;
        },
        showSplash: state => {
            return state.me && state.me.hasSeenFPSplash == false;
        },
        getGroups: state => id => {
            if (id == state.me.id) {
                return state.me.groups;
            } else if (state.profiles.hasOwnProperty(id)) {
                return state.profiles[id].groups;
            }
        },
    },
    mutations: {
        me(state, profile) {
            Vue.set(state, 'me', profile);
        },
        updateImage(state, image) {
            Vue.set(state.me, 'imageUrl', image);
        },
        profile(state, profile) {
            Vue.set(state.profiles, profile.id, profile);
        },
    },
    actions: {
        async me({ commit }) {
            const me = await ProfileApi.me();
            commit('me', me);
            return me;
        },
        edit({ state }, show) {
            state.showEditor = show;
        },
        async uploadImage({ commit }, event) {
            let files;
            files = event && event.target && event.target.files;
            const results = await addFile(files, FILE_TYPES.PROFILE);
            console.log(JSON.stringify(results.data));
            if (results.data.count > 0) {
                commit('updateImage', results.data.files[0].url);
            }
        },
        async update({ commit }, profile) {
            const me = await ProfileApi.update(profile);
            commit('me', me);
            return me;
        },
        async load({ commit, state }, id) {
            if (state.profileLoadPromises.hasOwnProperty(id)) {
                return await state.profileLoadPromises[id];
            }
            state.profileLoadPromises[id] = ProfileApi.get(id);
            const profile = await state.profileLoadPromises[id];
            delete state.profileLoadPromises[id];
            commit('profile', profile);
            return profile;
        },
        async loadMultiple({ dispatch }, ids) {
            const profiles = ids.map(id => dispatch('load', id));
            return profiles;
        },
    },
};

export default ProfileStore;
