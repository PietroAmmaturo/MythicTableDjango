const DrawingStore = {
    namespaced: true,
    state: {
        active: false,
        receivedLines: {},
        drawerLastActive: {},
        drawingColors: ['#d8d8f6', '#21a0a0', '#1ba73e', '#8b2635', '#c02d0c', '#f18701', '#002e3d'],
        activeColor: '#d8d8f6',
        brushSizes: [5, 10, 15],
        activeBrushSize: 5,
        brushRenderSizeModifier: 5,
    },
    mutations: {
        randomActiveColor(state) {
            state.activeColor = state.drawingColors[Math.floor(Math.random() * state.drawingColors.length)];
        },
    },
    actions: {
        toggle({ state }) {
            state.active = !state.active;
        },
        updateColor({ state }, color) {
            state.activeColor = color;
        },
        updateBrushSize({ state }, size) {
            state.activeBrushSize = parseInt(size) - state.brushRenderSizeModifier;
        },
        drawLine({ state, rootState }, { mapId, line }) {
            if (state.receivedLines[line.attrs.name] === undefined) {
                state.receivedLines[line.attrs.name] = [];
            }
            state.receivedLines = {
                ...state.receivedLines,
                [line.attrs.name]: [...state.receivedLines[line.attrs.name], line],
            };
            rootState.live.director.drawLine(mapId, line);
        },
        lineDrawReceived({ state, rootState }, { line }) {
            // This artist was active
            state.drawerLastActive[line.attrs.name] = Date.now();
            // Make sure it's not one of ours we've already saved
            if (rootState.profile.me.id !== line.attrs.name) {
                if (state.receivedLines[line.attrs.name] === undefined) {
                    state.receivedLines[line.attrs.name] = [];
                }
                state.receivedLines = {
                    ...state.receivedLines,
                    [line.attrs.name]: [...state.receivedLines[line.attrs.name], line],
                };
            }
        },
        purgeUsersLines({ state }, { userId }) {
            let receivedLines = { ...state.receivedLines };
            delete receivedLines[userId];
            state.receivedLines = receivedLines;
        },
        fadeUsersLines({ state }, { userId }) {
            let drawerLastActive = { ...state.drawerLastActive };
            delete drawerLastActive[userId];
            state.drawerLastActive = drawerLastActive;
        },
        clearLines({ state }) {
            state.receivedLines = [];
        },
    },
};

export default DrawingStore;
