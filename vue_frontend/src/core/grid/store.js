const GridStore = {
    namespaced: true,
    state: {
        active: false,
    },
    actions: {
        toggle({ state }) {
            state.active = !state.active;
        },
        reset({ state }) {
            state.active = false;
        },
    },
};

export default GridStore;
