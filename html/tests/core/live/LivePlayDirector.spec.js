import LivePlayDirector from '@/core/live/ChannelsLivePlayDirector';
import GameStateStore from '@/store/GameStateStore';
import LivePlayState from '@/core/live/LivePlayState';
import Vuex from 'vuex';
import { createLocalVue } from '@vue/test-utils';
import _ from 'lodash';

const localVue = createLocalVue();
localVue.use(Vuex);

describe('LivePlayDirector', () => {
    let store;
    let director;
    beforeEach(() => {
        store = new Vuex.Store({
            modules: {
                live: _.cloneDeep(LivePlayState),
                gamestate: _.cloneDeep(GameStateStore),
            },
        });
        director = new LivePlayDirector(store, null);
    });
    describe('General state', () => {
        beforeEach(() => {
            store.commit('live/setSessionId', '456');
        });
        it('store has this director', () => {
            expect(store.state.live.director).toBe(director);
        });
        it('this director has a store', () => {
            expect(director).toBe(store.state.live.director);
        });
    });
    describe('function calls', () => {
        it('A received roll goes into the gamestate store', () => {
            const diceResult = {
                timestamp: 123,
                userId: '456',
                sessionId: 'test',
                message: '1d4',
                result: '1d4 => 1! => 1',
            };
            director.onMessageReceived(diceResult);
            expect(store.state.gamestate.global.rollLog[0]).toBe(diceResult);
        });
        it('Multiple received rolls go into the gamestate store in the correct order', () => {
            const diceResult = {
                timestamp: 123,
                userId: '456',
                sessionId: 'test',
                message: '1d4',
                result: '1d4 => 1! => 1',
            };
            const diceResult2 = {
                timestamp: 1222,
                userId: '456',
                sessionId: 'test',
                message: '1d4',
                result: '1d4 => 2 => 2',
            };
            director.onMessageReceived(diceResult);
            director.onMessageReceived(diceResult2);
            expect(store.state.gamestate.global.rollLog[0]).toBe(diceResult);
            expect(store.state.gamestate.global.rollLog[1]).toBe(diceResult2);
        });
    });
    describe('signalR', () => {
        it('onCharacterAdded adds received character to state', () => {
            const characterDTOMock = {
                id: '123',
                token: {},
                asset: {},
            };
            director.onCharacterAdded(characterDTOMock);
            expect.objectContaining();
            expect(store.state.gamestate.entities).toMatchObject({ '123': characterDTOMock });
        });
        it('removeCharacter removes character from gamestate entities', () => {
            const characterDTOMock = {
                id: 'characterDTOMock',
                token: {},
                asset: {},
            };
            const characterDTOMock2 = {
                id: 'characterDTOMock2',
                token: {},
                asset: {},
            };
            store.dispatch('gamestate/entities/load', [characterDTOMock, characterDTOMock2]);
            director.onCharacterRemoved('characterDTOMock');
            expect(store.state.gamestate.entities).toMatchObject({ characterDTOMock2 });
        });
    });
});
