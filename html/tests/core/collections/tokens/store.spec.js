import { createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import _ from 'lodash';
import { COLLECTION_TYPES } from '@/core/collections/constants';

import TokenStore from '@/core/collections/tokens/store.js';
import Token from '../../../../src/core/collections/tokens/model.js';
import CollectionStore from '@/core/collections/store';

const localVue = createLocalVue();
localVue.use(Vuex);

let store;
const defaultState = {
    maps: {
        id01: { _id: 'id01', foo: 'bar' },
        id02: { _id: 'id02', foo: 'barbar' },
        id03: { _id: 'id03', foo: { bar: { foo1: { redHerring: null } } } },
    },
    characters: {
        id03: { _id: 'id03', foo: 'char' },
        id04: { _id: 'id04', foo: 'charbar' },
    },
    tokens: {
        id01: {
            _id: 'id01',
            mapId: 'id02',
            pos: {
                q: 0,
                r: 0,
            },
            backgroundColor: null,
            character: null,
            icon: null,
        },
    },
};

const defaultToken = {
    _id: 'id01',
    mapId: 'id02',
    pos: {
        q: 0,
        r: 0,
    },
    backgroundColor: null,
    character: null,
    icon: null,
    _token_version: 1,
};

function storeBuilder() {
    let initialStore = {
        modules: {
            tokens: _.cloneDeep(TokenStore),
            collections: {
                ..._.cloneDeep(CollectionStore),
                state: _.cloneDeep(defaultState),
            },
            live: {
                namespaced: true,
                actions: {
                    updateCampaignObject: jest.fn(),
                },
            },
        },
    };
    store = new Vuex.Store(initialStore);
}

describe('TokenStore', () => {
    beforeEach(storeBuilder);
    describe('Actions', () => {
        describe('update', () => {
            let getters = {};
            let dispatch;
            beforeEach(() => {
                getters.getRawToken = jest.fn().mockReturnValue(defaultToken);
                dispatch = jest.fn();
            });
            it('Should call collections/update with the changes made.', () => {
                let token = new Token(defaultToken);
                TokenStore.actions.update({ getters, dispatch }, token);
                expect(dispatch).toHaveBeenCalledWith(
                    'collections/update',
                    { collection: COLLECTION_TYPES.tokens, id: token._id, patch: [] },
                    { root: true },
                );
            });
            it('Should have an empty patch even if the pos is different.', () => {
                let token = new Token(defaultToken);
                token.pos = { q: 7, r: 7 };
                TokenStore.actions.update({ getters, dispatch }, token);
                expect(dispatch).toHaveBeenCalledWith(
                    'collections/update',
                    { collection: COLLECTION_TYPES.tokens, id: token._id, patch: [] },
                    { root: true },
                );
            });
        });
        describe('moveToken', () => {
            let updateCollectionSpy;
            let moveToken;
            beforeEach(() => {
                updateCollectionSpy = jest.spyOn(store._actions['collections/update'], '0');
                moveToken = store._actions['tokens/moveToken'][0];
            });
            afterEach(() => {
                updateCollectionSpy.mockRestore();
            });
            const movedToken = {
                _id: 'id01',
                mapId: 'Map1',
                pos: {
                    q: 5,
                    r: 5,
                },
                backgroundColor: null,
                character: null,
                icon: null,
            };
            it('Should call the collection update on success.', async () => {
                await moveToken(movedToken);
                expect(updateCollectionSpy).toHaveBeenCalledWith({
                    collection: COLLECTION_TYPES.tokens,
                    id: movedToken._id,
                    patch: [
                        { op: 'replace', path: '/pos/r', value: 5 },
                        { op: 'replace', path: '/pos/q', value: 5 },
                    ],
                });
            });
            it('Should not call the server if there is no patch.', async () => {
                await moveToken({ ...movedToken, pos: { q: 0, r: 0 } });
                expect(updateCollectionSpy).toHaveBeenCalledTimes(0);
            });
        });
    });
});
