import DrawingStore from '@/core/drawing/store.js';

describe('DrawingStore', () => {
    const { state, mutations, actions } = DrawingStore;
    const rootState = {
        profile: {
            me: {
                id: 'meId',
            },
        },
        live: {
            director: {
                drawLine: jest.fn(),
            },
        },
    };
    const argumentsObject = {
        mapId: 'mapId',
        line: {
            attrs: {
                name: 'lineName',
            },
        },
        userId: 'userId',
    };

    describe('state', () => {});
    describe('mutations', () => {
        describe('randomActiveColor', () => {
            test('When mutation triggers it assigns active color from drawingColors.', () => {
                state.activeColor = 'Not a color';
                mutations.randomActiveColor(state);
                expect(state.drawingColors.find(color => color === state.activeColor)).toBeTruthy();
            });
        });
    });
    describe('actions', () => {
        describe('toggle', () => {
            test('Flips the boolean value for if drawing is active.', () => {
                const initial = state.active;
                actions.toggle(DrawingStore);
                expect(state.active).toBe(!initial);
            });
        });
        describe('updateColor', () => {
            test('Changes the activeColor to the given string.', () => {
                const color = 'Pretty Color';
                actions.updateColor(DrawingStore, color);
                expect(state.activeColor).toBe(color);
                mutations.randomActiveColor(state);
            });
        });
        describe('updateBrushSize', () => {
            test('Convert pixels string into number less the brushRenderSizeModifier', () => {
                const newSize = '137px';
                actions.updateBrushSize(DrawingStore, newSize);
                expect(state.activeBrushSize).toBe(137 - state.brushRenderSizeModifier);
            });
        });
        describe('drawLine', () => {
            const { mapId, line } = argumentsObject;
            beforeEach(() => actions.drawLine({ state, rootState }, argumentsObject));
            afterEach(() => jest.resetAllMocks());
            test('Add line and line information to received lines.', () => {
                expect(state.receivedLines[line.attrs.name]).toBeTruthy();
            });
            test('Call the live director to add the line.', () => {
                expect(rootState.live.director.drawLine).toHaveBeenCalledWith(mapId, line);
            });
        });
        describe('lineDrawReceived', () => {
            const meId = rootState.profile.me.id;
            const { line } = argumentsObject;
            const datePlaceholder = 'Fake Date';
            test('Assigns when drawer was last active to state.', () => {
                state.drawerLastActive = {};
                Date.now = jest.spyOn(Date, 'now').mockImplementationOnce(() => datePlaceholder);
                actions.lineDrawReceived({ state, rootState }, argumentsObject);
                expect(state.drawerLastActive[line.attrs.name]).toBe(datePlaceholder);
            });
            test('Updates lines if the profile name is not the attr name.', () => {
                state.receivedLines = {};
                actions.lineDrawReceived({ state, rootState }, argumentsObject);
                expect(state.receivedLines[line.attrs.name]).toBeTruthy();
            });
            test('Will not update lines if they are not drawn by user.', () => {
                state.receivedLines = {};
                rootState.profile.me.id = line.attrs.name;
                actions.lineDrawReceived({ state, rootState }, argumentsObject);
                expect(state.receivedLines[line.attrs.name]).toBeFalsy();
                rootState.profile.me.id = meId;
            });
        });
        describe('purgeUsersLines', () => {
            const receivedLines = {
                user1: [{ line: 'line' }, { anotherLine: 'line' }],
                user2: [{ line: 'line' }, { anotherLine: 'line' }],
                user3: [{ line: 'line' }, { anotherLine: 'line' }],
                user4: [{ line: 'line' }, { anotherLine: 'line' }],
            };
            const purgedUsersLines = {
                user1: [{ line: 'line' }, { anotherLine: 'line' }],
                user3: [{ line: 'line' }, { anotherLine: 'line' }],
                user4: [{ line: 'line' }, { anotherLine: 'line' }],
            };
            test('Removes the lines associate with the given user (state.receivedLines).', () => {
                state.receivedLines = receivedLines;
                actions.purgeUsersLines(DrawingStore, { userId: 'user2' });
                expect(state.receivedLines).toStrictEqual(purgedUsersLines);
            });
        });
        describe('fadeUsersLines', () => {
            const drawerLines = {
                user1: [{ line: 'line' }, { anotherLine: 'line' }],
                user2: [{ line: 'line' }, { anotherLine: 'line' }],
                user3: [{ line: 'line' }, { anotherLine: 'line' }],
                user4: [{ line: 'line' }, { anotherLine: 'line' }],
            };
            const fadedUserLines = {
                user1: [{ line: 'line' }, { anotherLine: 'line' }],
                user3: [{ line: 'line' }, { anotherLine: 'line' }],
                user4: [{ line: 'line' }, { anotherLine: 'line' }],
            };
            test('Removes the lines associate with the given user (state.drawerLastActive).', () => {
                state.drawerLastActive = drawerLines;
                actions.fadeUsersLines(DrawingStore, { userId: 'user2' });
                expect(state.drawerLastActive).toStrictEqual(fadedUserLines);
            });
        });
        describe('clearLines', () => {
            const receivedLines = {
                user1: [{ line: 'line' }, { anotherLine: 'line' }],
                user2: [{ line: 'line' }, { anotherLine: 'line' }],
                user3: [{ line: 'line' }, { anotherLine: 'line' }],
                user4: [{ line: 'line' }, { anotherLine: 'line' }],
            };
            test('Removes all received lines.', () => {
                state.receivedLines = receivedLines;
                actions.clearLines(DrawingStore);
                expect(state.receivedLines).toStrictEqual([]);
            });
        });
    });
});
