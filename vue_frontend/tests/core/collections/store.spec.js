import _ from 'lodash';
import CollectionStore from '@/core/collections/store';
import axios from 'axios';
import { Vue } from 'vue-property-decorator';

jest.mock('axios');

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
};

describe('CollectionStore', () => {
    const getItem = CollectionStore.getters.getItem;
    let state;

    beforeEach(() => {
        state = _.cloneDeep(defaultState);
    });

    describe('getters', () => {
        describe('getItem()', () => {
            it('returns map by ID', () => {
                const result = getItem(state)('maps', 'id01');
                expect(result).toBe(state.maps.id01);
            });

            it('returns null when no collection', () => {
                const result = getItem(state)('shoes', 'id01');
                expect(result).toBeNull();
            });

            it('returns null when no item is found', () => {
                const result = getItem(state)('characters', 'id01');
                expect(result).toBeNull();
            });
        });

        describe('getCollection()', () => {
            const getCollection = CollectionStore.getters.getCollection;
            it('returns collection', () => {
                const result = getCollection(state)('maps');
                expect(result).toBe(state.maps);
            });

            it('empty list when no collection', () => {
                const result = getCollection(state)('shoes');
                expect(result).toEqual([]);
            });
        });

        describe('maps', () => {
            const maps = CollectionStore.getters.maps;

            it('returns maps', () => {
                const result = maps(state)();
                expect(result).toEqual(state.maps);
            });
        });
    });

    describe('mutations', () => {
        const add = CollectionStore.mutations.add;

        describe('patch', () => {
            const doPatch = CollectionStore.mutations.patch;

            it('performs basic patch', () => {
                const patch = [
                    {
                        op: 'replace',
                        path: '/foo',
                        value: 'bar2',
                    },
                ];
                doPatch(state, { collection: 'maps', id: 'id01', patch });
                const result = getItem(state)('maps', 'id01');
                expect(result.foo).toEqual('bar2');
            });
            it('adds reactivity before patching, new property at base', () => {
                let spyVueSet = jest.spyOn(Vue, 'set');
                const patch = [
                    {
                        op: 'add',
                        path: '/foo1',
                        value: 'bar1',
                    },
                ];
                const initial = getItem(state)('maps', 'id01');
                doPatch(state, { collection: 'maps', id: 'id01', patch });
                const result = getItem(state)('maps', 'id01');
                expect(result.foo1).toEqual('bar1');
                expect(spyVueSet).toHaveBeenCalledWith(initial, 'foo1', 'bar1');
                spyVueSet.mockRestore();
            });
            it('adds reactivity before patching, new property deep', () => {
                let spyVueSet = jest.spyOn(Vue, 'set');
                const patch = [
                    {
                        op: 'add',
                        path: '/foo/bar/foo1/bar1',
                        value: 'foo2',
                    },
                ];
                doPatch(state, { collection: 'maps', id: 'id03', patch });
                const result = getItem(state)('maps', 'id03');
                expect(result.foo.bar.foo1.bar1).toEqual('foo2');
                expect(spyVueSet).toHaveBeenCalledWith({ bar1: 'foo2', redHerring: null }, 'bar1', 'foo2');
                spyVueSet.mockRestore();
            });
        });

        describe('add', () => {
            it('adds new collection', () => {
                add(state, { collection: 'shoes', item: { _id: 'id05', foo: 'shoe' } });
                const result = getItem(state)('shoes', 'id05');
                expect(result.foo).toEqual('shoe');
            });
        });

        describe('remove', () => {
            const remove = CollectionStore.mutations.remove;

            it('removes non-existant item', () => {
                remove(state, { collection: 'shoes', id: 'id05' });
            });

            it('removes an item', () => {
                add(state, { collection: 'shoes', item: { _id: 'id05', foo: 'shoe' } });
                remove(state, { collection: 'shoes', id: 'id05' });
                const result = getItem(state)('shoes', 'id05');
                expect(result).toBe(null);
            });
        });

        describe('purge', () => {
            const purge = CollectionStore.mutations.purge;

            it('purge removes all items', () => {
                add(state, { collection: 'shoes', item: { _id: 'id05', foo: 'shoe' } });
                add(state, { collection: 'hats', item: { _id: 'id06', foo: 'hat' } });
                purge(state);
                const result = getItem(state)('shoes', 'id05');
                expect(result).toBe(null);
            });
        });
    });

    describe('actions', () => {
        let dispatch;
        let commit;

        beforeEach(() => {
            dispatch = jest.fn().mockResolvedValue(null);
            commit = jest.fn();
            axios.get.mockReset();
        });

        describe('update', () => {
            it('dispatches to live store updateCampaignObject', async () => {
                const params = { collection: 'collection', id: 'id', patch: {} };
                await CollectionStore.actions.update({ dispatch }, params);
                expect(dispatch).toHaveBeenCalledWith('live/updateCampaignObject', params, { root: true });
            });
        });

        describe('add', () => {
            it('dispatches to live store addCampaignObject', async () => {
                const params = { collection: 'collection', item: {} };
                await CollectionStore.actions.add({ dispatch }, params);
                expect(dispatch).toHaveBeenCalledWith('live/addCampaignObject', params, { root: true });
            });
        });

        describe('remove', () => {
            it('dispatches to live store removeCampaignObject', async () => {
                const params = { collection: 'collection', id: 'id' };
                await CollectionStore.actions.remove({ dispatch }, params);
                expect(dispatch).toHaveBeenCalledWith('live/removeCampaignObject', params, { root: true });
            });
        });

        describe('load', () => {
            it('adds items to collection', async () => {
                const items = [{ id: 'id01' }];
                const resp = { data: items };
                axios.get.mockResolvedValue(resp);

                const rootState = { live: { sessionId: 'id' } };
                await CollectionStore.actions.load({ commit, rootState }, { collection: 'collection' });

                expect(commit).toHaveBeenCalledWith('add', { collection: 'collection', item: { id: 'id01' } });
            });
        });

        describe('onAdded', () => {
            it('adds item', async () => {
                await CollectionStore.actions.onAdded({ commit }, { collection: 'collection', item: { id: 'id01' } });
                expect(commit).toHaveBeenCalledWith('add', { collection: 'collection', item: { id: 'id01' } });
            });
        });

        describe('onRemoved', () => {
            it('removes item', async () => {
                await CollectionStore.actions.onRemoved({ commit }, { collection: 'collection', id: 'id01' });
                expect(commit).toHaveBeenCalledWith('remove', { collection: 'collection', id: 'id01' });
            });
        });

        describe('onUpdated', () => {
            it('patches item', async () => {
                await CollectionStore.actions.onUpdated(
                    { commit },
                    { collection: 'collection', id: 'id01', patch: {} },
                );
                expect(commit).toHaveBeenCalledWith('patch', { collection: 'collection', id: 'id01', patch: {} });
            });
        });

        describe('onLoad', () => {
            const onLoad = CollectionStore.actions.onLoad;
            const add = CollectionStore.mutations.add;
            const mockCommit = function(p1, { collection, item }) {
                add(state, { collection, item });
            };

            it('performs basic onLoad', () => {
                const maps = [
                    { _id: 'id05', foo: 'bar5' },
                    { _id: 'id06', foo: 'bar6' },
                ];
                onLoad({ commit: mockCommit }, { collection: 'maps', items: maps });
                let result = getItem(state)('maps', 'id05');
                expect(result.foo).toEqual('bar5');
                result = getItem(state)('maps', 'id06');
                expect(result.foo).toEqual('bar6');
            });

            it('handles duplicates and over-writes', () => {
                const maps = [
                    { _id: 'id04', foo: 'over-written' },
                    { _id: 'id05', foo: 'bar5' },
                ];
                onLoad({ commit: mockCommit }, { collection: 'maps', items: maps });
                let result = getItem(state)('maps', 'id04');
                expect(result.foo).toEqual('over-written');
                result = getItem(state)('maps', 'id05');
                expect(result.foo).toEqual('bar5');
            });
        });

        describe('reload', () => {
            let commit;

            beforeEach(() => {
                commit = jest.fn();
                axios.get.mockReset();
            });

            it('purges and loads each collection', async () => {
                axios.get.mockImplementation(url => {
                    switch (url) {
                        case '/api/collections/maps/campaign/campaign-id':
                            return Promise.resolve({ data: [{ id: 'map01' }] });
                        case '/api/collections/characters/campaign/campaign-id':
                            return Promise.resolve({ data: [{ id: 'character01' }] });
                        default:
                            return Promise.reject(new Error('not found'));
                    }
                });

                const rootState = { live: { sessionId: 'campaign-id' } };
                await CollectionStore.actions.reload({ state, commit, rootState });
                expect(commit).toHaveBeenCalledTimes(3);
                expect(commit).toHaveBeenCalledWith('purge');
                expect(commit).toHaveBeenCalledWith('add', { collection: 'maps', item: { id: 'map01' } });
                expect(commit).toHaveBeenCalledWith('add', { collection: 'characters', item: { id: 'character01' } });
            });
        });
    });
});
