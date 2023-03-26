import Vuex from 'vuex';
import { createLocalVue } from '@vue/test-utils';
import GameStateStore from '@/store/GameStateStore';

const storeConfig = GameStateStore;
storeConfig.namespaced = false;

const localVue = createLocalVue();
localVue.use(Vuex);

const store = new Vuex.Store(storeConfig);

const resetState = store => {
    store.replaceState({
        base: {
            entities: {
                entity1: 'foo',
                entity2: 'bar',
            },
            global: {
                global1: 'foo',
                global2: 'bar',
                global3: [],
            },
            ruleset: {},
        },
        entities: {
            entity1: 'foo',
            entity2: 'bar',
        },
        global: {
            global1: 'foo',
            global2: 'bar',
            global3: [],
        },
        ruleset: {},
    });
};

describe('GameStateStore', () => {
    describe('getters', () => {});
    describe('actions', () => {
        beforeEach(() => {
            resetState(store);
        });

        describe('setBase()', () => {
            it('Updates the base to the current state', () => {
                let newBaseEntities = {
                    ent: 1,
                    ent2: '2',
                };
                let newBaseGlobal = {
                    glob: 1,
                    glob2: '2',
                };

                store.state.entities = newBaseEntities;
                store.state.global = newBaseGlobal;

                store.dispatch('setBase');

                expect(store.state.base.entities).toEqual(newBaseEntities);
                expect(store.state.base.global).toEqual(newBaseGlobal);
            });
        });
        describe('patch(patch)', () => {
            describe('with valid operations', () => {
                it('can do add operations', () => {
                    const patch = [
                        { op: 'add', path: '/entities/entity3', value: 'baz' },
                        { op: 'add', path: '/global/global4', value: {} },
                        { op: 'add', path: '/global/global4/goo', value: 'gaa' },
                    ];
                    store.dispatch('patch', patch);

                    expect(store.state.entities).toEqual({
                        entity1: 'foo',
                        entity2: 'bar',
                        entity3: 'baz',
                    });
                    expect(store.state.global).toEqual({
                        global1: 'foo',
                        global2: 'bar',
                        global3: [],
                        global4: {
                            goo: 'gaa',
                        },
                    });
                });
                it('can do remove operations', () => {
                    const patch = { op: 'remove', path: '/entities/entity2' };
                    store.dispatch('patch', patch);
                    expect(store.state.entities).toEqual({
                        entity1: 'foo',
                    });
                });
                it('can do replace operations', () => {
                    const patch = { op: 'replace', path: '/entities/entity2', value: 'baz' };
                    store.dispatch('patch', patch);
                    expect(store.state.entities).toEqual({
                        entity1: 'foo',
                        entity2: 'baz',
                    });
                });
                it('can do move operations', () => {
                    const patch = { op: 'move', from: '/entities/entity2', path: '/entities/entity3' };
                    store.dispatch('patch', patch);
                    expect(store.state.entities).toEqual({
                        entity1: 'foo',
                        entity3: 'bar',
                    });
                });
                it('can do copy operations', () => {
                    const patch = { op: 'copy', from: '/entities/entity2', path: '/entities/entity3' };
                    store.dispatch('patch', patch);
                    expect(store.state.entities).toEqual({
                        entity1: 'foo',
                        entity2: 'bar',
                        entity3: 'bar',
                    });
                });
                it('can do successful test operations', () => {
                    const patch = { op: 'test', path: '/entities/entity2', value: 'bar' };
                    store.dispatch('patch', patch);
                });
                it('can add a new list', () => {
                    const patch = { op: 'add', path: '/global/global4', value: [] };
                    store.dispatch('patch', patch);
                    expect(store.state.global.global4).toEqual([]);
                });
                it('can add an item to a list', () => {
                    const patch = { op: 'add', path: '/global/global3/0', value: 'foo' };
                    store.dispatch('patch', patch);
                    expect(store.state.global.global3).toEqual(['foo']);
                });
                it('can add an item to a specific index in a list', () => {
                    const patch = [
                        { op: 'add', path: '/global/global3/0', value: 'foo' },
                        { op: 'add', path: '/global/global3/1', value: 'bar' },
                        { op: 'add', path: '/global/global3/1', value: 'baz' },
                    ];
                    store.dispatch('patch', patch);
                    expect(store.state.global.global3).toEqual(['foo', 'baz', 'bar']);
                });
                it('can add an item to the first index in a list', () => {
                    const patch = [
                        { op: 'add', path: '/global/global3/0', value: 'foo' },
                        { op: 'add', path: '/global/global3/0', value: 'bar' },
                    ];
                    store.dispatch('patch', patch);
                    expect(store.state.global.global3).toEqual(['bar', 'foo']);
                });
                it('can add an item to the end of a list', () => {
                    let patch = { op: 'add', path: '/global/global3/-', value: 'foo' };
                    store.dispatch('patch', patch);
                    expect(store.state.global.global3).toEqual(['foo']);

                    patch = { op: 'add', path: '/global/global3/-', value: 'bar' };
                    store.dispatch('patch', patch);
                    expect(store.state.global.global3).toEqual(['foo', 'bar']);
                });
                it('can remove an item from the beginning of a list', () => {
                    let patch = [
                        { op: 'add', path: '/global/global3/0', value: 'foo' },
                        { op: 'add', path: '/global/global3/1', value: 'bar' },
                    ];
                    store.dispatch('patch', patch);
                    expect(store.state.global.global3).toEqual(['foo', 'bar']);

                    patch = { op: 'remove', path: '/global/global3/0' };
                    store.dispatch('patch', patch);
                    expect(store.state.global.global3).toEqual(['bar']);
                });
                it('can remove an item from the end of a list', () => {
                    let patch = [
                        { op: 'add', path: '/global/global3/0', value: 'foo' },
                        { op: 'add', path: '/global/global3/1', value: 'bar' },
                    ];
                    store.dispatch('patch', patch);
                    expect(store.state.global.global3).toEqual(['foo', 'bar']);

                    patch = { op: 'remove', path: '/global/global3/1' };
                    store.dispatch('patch', patch);
                    expect(store.state.global.global3).toEqual(['foo']);
                });
            });
            describe('with illegal operations', () => {
                it('Throws exceptions when trying to remove forbidden paths', () => {
                    let patch = { op: 'remove', path: '/entities' };
                    let f = () => store.dispatch('patch', patch);
                    expect(f).toThrow(Error);

                    patch = { op: 'remove', path: '/global' };
                    f = () => store.dispatch('patch', patch);
                    expect(f).toThrow(Error);

                    patch = { op: 'remove', path: '/deltas' };
                    f = () => store.dispatch('patch', patch);
                    expect(f).toThrow(Error);
                });

                it('Throws exceptions when trying to move forbidden paths', () => {
                    let patch = { op: 'move', from: '/entities', path: '/global/test' };
                    let f = () => store.dispatch('patch', patch);
                    expect(f).toThrow(Error);

                    patch = { op: 'move', from: '/global', path: '/global/test' };
                    f = () => store.dispatch('patch', patch);
                    expect(f).toThrow(Error);

                    patch = { op: 'move', from: '/deltas', path: '/global/test' };
                    f = () => store.dispatch('patch', patch);
                    expect(f).toThrow(Error);
                });

                // TODO - Find out why we get this error `[Vue warn]: Cannot set reactive property on undefined, null, or primitive value: foo`
                it('Throws an exception when attempting to use list syntax on a non list entry', () => {
                    let patch = { op: 'add', path: '/entities/entity1/-', value: 'foo' };
                    let f = () => store.dispatch('patch', patch);
                    expect(f).toThrow(Error);
                    expect(store.state.entities).toEqual(store.state.base.entities);
                });
                it('throws an exception when adding to an out of bounds index in a list', () => {
                    const patch = { op: 'add', path: '/global/global3/4', value: 'foo' };
                    let f = () => store.dispatch('patch', patch);
                    expect(f).toThrow(Error);
                });
            });
        });
    });
});
