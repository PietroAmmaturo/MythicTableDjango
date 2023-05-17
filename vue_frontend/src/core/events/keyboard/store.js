const state = {
    pressedKey: '',
};

const mutations = {
    keyPressed(state, key) {
        state.pressedKey = key;
    },
};

let dispatchTrackKeys;
let dispatchFocusActive;
let dispatchFocusInactive;

const actions = {
    triggerComplete({ commit }) {
        commit('keyPressed', '');
    },
    trackKeys({ commit }, event) {
        commit('keyPressed', event.key);
    },
    focusActive() {
        document.removeEventListener('keyup', dispatchTrackKeys);
    },
    focusInactive() {
        document.addEventListener('keyup', dispatchTrackKeys);
    },
    initiateFunctions({ dispatch }) {
        dispatchFocusActive = event => dispatch('focusActive', event);
        dispatchFocusInactive = event => dispatch('focusInactive', event);
        dispatchTrackKeys = event => dispatch('trackKeys', event);
    },
    addTracking({ dispatch }) {
        dispatch('initiateFunctions');
        document.addEventListener('focusin', dispatchFocusActive);
        document.addEventListener('focusout', dispatchFocusInactive);
        document.addEventListener('keyup', dispatchTrackKeys);
    },
    removeTracking() {
        document.removeEventListener('focusin', dispatchFocusActive);
        document.removeEventListener('focusout', dispatchFocusInactive);
        document.removeEventListener('keyup', dispatchTrackKeys);
    },
};

const KeyboardStore = {
    namespaced: true,
    state,
    mutations,
    actions,
};

export default KeyboardStore;
