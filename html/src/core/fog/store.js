const FogStore = {
    namespaced: true,
    state: {
        active: false,
        obscure: true,
    },
    mutations: {
        toggleActive(state) {
            state.active = !state.active;
        },
        setActive(state, value) {
            state.active = value;
        },
        toggleObscure(state) {
            state.obscure = !state.obscure;
        },
        setObscure(state, value) {
            state.obscure = value;
        },
    },
};

export default FogStore;
