const EditStore = {
    namespaced: true,
    state: {
        editMap: false,
        hiddenSidebar: false,
    },
    mutations: {
        setEditMap(state, value) {
            state.editMap = value;
        },
        setHiddenSidebar(state, value) {
            state.hiddenSidebar = value;
        },
        toggleHiddenSidebar(state) {
            state.hiddenSidebar = !state.hiddenSidebar;
        },
    },
};

export default EditStore;
