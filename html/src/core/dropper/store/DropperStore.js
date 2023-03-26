const DropperStore = {
    namespaced: true,
    state: {
        draggedItem: null,
    },
    mutations: {
        setDragged(state, item) {
            state.draggedItem = item;
        },
    },
    actions: {
        startDrag(context, item) {
            context.commit('setDragged', item);
        },
        reset({ commit }) {
            commit('setDragged', null);
        },
    },
    getters: {
        draggedItem: state => {
            return state.draggedItem;
        },
        ready: state => {
            return state.draggedItem != null;
        },
    },
};

export default DropperStore;
