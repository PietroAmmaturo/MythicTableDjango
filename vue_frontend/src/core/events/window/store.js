const state = {
    windowSize: { width: 100, height: 100 },
    displayedModals: [],
};

const getters = {
    isDisplayingModal(state) {
        return state.displayedModals.length > 0;
    },
};

const mutations = {
    updateWindowSize(state, windowSize) {
        state.windowSize = windowSize;
    },
    pushDisplayedModal(state, modalId) {
        state.displayedModals.push(modalId);
    },
    popDisplayedModal(state, modalId) {
        if (!state.displayedModals.includes(modalId)) {
            console.warn(`popDisplayedModal() called with unknown modal ID ${modalId}`);
            return;
        }

        const modalIndex = state.displayedModals.indexOf(modalId);
        state.displayedModals.splice(modalIndex, 1);
    },
};

let trackWindowResize;

const actions = {
    windowResize({ commit }) {
        commit('updateWindowSize', { width: window.innerWidth, height: window.innerHeight });
    },
    initiateFunctions({ dispatch }) {
        dispatch('windowResize');
        trackWindowResize = () => dispatch('windowResize');
    },
    addTracking({ dispatch }) {
        dispatch('initiateFunctions');
        window.addEventListener('resize', trackWindowResize);
    },
    removeTracking() {
        window.removeEventListener('resize', trackWindowResize);
    },
};

const WindowStore = {
    namespaced: true,
    state,
    getters,
    mutations,
    actions,
};

export default WindowStore;
