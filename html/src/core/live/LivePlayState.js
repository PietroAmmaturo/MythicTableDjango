const LivePlayState = {
    namespaced: true,
    state: {
        connected: false,
        sessionId: null,
        director: null,
    },
    mutations: {
        setDirector(state, director) {
            state.director = director;
        },
        setSessionId(state, sessionId) {
            state.sessionId = sessionId;
        },
    },
    actions: {
        addCharacter({ state }, { image, pos, mapId }) {
            state.director.addCharacter(image, pos, mapId);
        },
        removeCharacter({ state }, { characterId }) {
            state.director.removeCharacter(characterId);
        },
        async updateCampaignObject({ state }, { collection, id, patch }) {
            await state.director.updateCampaignObject(collection, id, patch);
        },
        async addCampaignObject({ state }, { collection, item }) {
            await state.director.addCampaignObject(collection, item);
        },
        async removeCampaignObject({ state }, { collection, id }) {
            await state.director.removeCampaignObject(collection, id);
        },
    },
};

export default LivePlayState;
