import Vuex from 'vuex';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import _ from 'lodash';

import Map from '@/table/components/scene/Scene.vue';
import PlayToken from '@/characters/components/PlayToken.vue';
import GameStateStore from '@/store/GameStateStore.js';
import LivePlayState from '@/core/live/LivePlayState.js';
import DrawingStore from '@/core/drawing/store.js';
import FogStore from '@/core/fog/store.js';

const localVue = createLocalVue();
localVue.use(Vuex);

let store;
const map = {
    name: 'New Map',
    map: { stage: '.' },
    stage: {
        grid: { type: 'square', size: 50 },
        bounds: {
            nw: { q: 0, r: 0 },
            se: { q: 49, r: 49 },
        },
        color: '#223344',
        elements: [
            {
                id: 'background',
                asset: { kind: 'image', src: '/static/assets/tutorial/thank-you.jpg' },
                pos: { q: 0, r: 0, pa: '00' },
            },
        ],
    },
};

let konvaBypass;
let wrapper;
let vm;

let itemOwnerValue = jest.fn().mockReturnValue(true);
let gameMasterValue = jest.fn().mockReturnValue(true);

function buildWrapper() {
    const stubs = {
        PlayToken: _.cloneDeep(PlayToken),
        'unleash-feature': true,
    };
    konvaBypass = jest.spyOn(Map.methods, 'addMouseEvents').mockImplementation(() => 'Added!');
    GameStateStore.state.activeMap = map;
    store = new Vuex.Store({
        modules: {
            gamestate: _.cloneDeep(GameStateStore),
            live: _.cloneDeep(LivePlayState),
            drawing: _.cloneDeep(DrawingStore),
            fog: _.cloneDeep(FogStore),
            tokens: {
                namespaced: true,
                getters: {
                    getToken: () => () => jest.fn().mockReturnValue({ _userid: 'userId' }),
                },
            },
            hasPermission: {
                namespaced: true,
                getters: {
                    isItemOwner: () => itemOwnerValue,
                    getGameMasterStatus: gameMasterValue,
                },
            },
        },
    });
    wrapper = shallowMount(Map, { localVue, store, stubs });
    wrapper.vm.$refs['playTokens'] = [
        { entity: { _id: 1, selected: false } },
        { entity: { _id: 2, selected: false } },
        { entity: { _id: 3, selected: false } },
    ];
    vm = wrapper.vm;
}

describe('Map component', () => {
    beforeEach(buildWrapper);

    afterEach(() => {
        konvaBypass.mockRestore();
    });

    it('should have a PlayToken stub', () => {
        const playToken = wrapper.find('playToken');
        expect(playToken).toBeDefined();
    });
    it('should have 3 "playTokens" as a $ref', () => {
        expect(wrapper.vm.$refs['playTokens'].length).toEqual(3);
    });

    describe('default', () => {
        describe('.renderContext', () => {
            it('is defined', () => {
                expect(vm.renderContext).toBeDefined();
            });

            it('has gridSpace property', () => {
                expect(vm.renderContext.gridSpace).toBeDefined();
            });

            it('has default gridSpace matching configs from stage', () => {
                expect(vm.renderContext.gridSpace.type).toEqual(vm.stage.grid.type);
                expect(vm.renderContext.gridSpace.size).toEqual(vm.stage.grid.size);
            });

            it('has pixelRatio', () => {
                expect(vm.renderContext.pixelRatio).toEqual(1);
            });
        });

        describe('.stage', () => {
            describe('has default stage...', () => {
                it('size is 50x50', () => {
                    expect(vm.stage.bounds).toEqual({
                        nw: { q: 0, r: 0 },
                        se: { q: 49, r: 49 },
                    });
                });

                it('with square grid of size 50', () => {
                    expect(vm.stage.grid.type).toEqual('square');
                    expect(vm.stage.grid.size).toEqual(50);
                });
            });
        });
    });
    describe('Computed', () => {
        describe('isStageDraggable', () => {
            it('Should disable panning when user is trying to draw.', async () => {
                await wrapper.vm.$store.dispatch('drawing/toggle');
                expect(wrapper.vm.isDrawing).toBe(true);
                expect(wrapper.vm.stageConfig.draggable).toBe(false);
            });
            it('Should disable panning when user is trying to edit fog.', async () => {
                await wrapper.vm.$store.commit('fog/setActive', true);
                expect(wrapper.vm.stageConfig.draggable).toBe(false);
            });
            it('Should enable panning when user is not doing the above actions.', async () => {
                expect(wrapper.vm.isDrawing).toBe(false);
                await wrapper.vm.$store.commit('fog/setActive', false);
                expect(wrapper.vm.stageConfig.draggable).toBe(true);
            });
        });
    });
    describe('Methods', () => {
        describe('zoomCaps', () => {
            it('returns object with maxZoom and minZoom', () => {
                const stage = {
                    height: () => 300,
                    width: () => 600,
                };
                const result = {
                    maxZoom: 4,
                    minZoom: 0.12,
                };
                expect(vm.zoomCaps(stage)).toStrictEqual(result);
            });
        });
    });
});
