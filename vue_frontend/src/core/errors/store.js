const ErrorStore = {
    namespaced: true,
    state: {
        modalMessage: '',
        closeCallback: null,
    },
    actions: {
        close({ state }) {
            state.modalMessage = '';
            if (state.closeCallback) {
                state.closeCallback();
            }
        },
        modal({ state }, { message, closeCallback = () => {} }) {
            state.modalMessage = message;
            state.closeCallback = closeCallback;
        },
    },
};

export default ErrorStore;
