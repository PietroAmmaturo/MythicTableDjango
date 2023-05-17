import { mount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import VueMaterial from 'vue-material';

import GridInterface from '@/table/components/play-view/Header/Tools/GridInterface.vue';
import TutorialModal from '@/core/components/TutorialModal.vue';
import collectionsStore from '@/core/collections/store.js';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(VueMaterial);

let wrapper;
let store;

const gridWithOffset = {
    snap: true,
    size: 75,
    offset: {
        x: 5,
        y: 10,
    },
    visible: true,
};

function buildWrapper(grid = gridWithOffset) {
    store = {
        modules: {
            collections: collectionsStore,
            grid: {
                namespaced: true,
                state: {
                    active: false,
                },
                actions: {
                    toggle: ({ state }) => (state.active = !state.active),
                },
            },
            gamestate: {
                namespaced: true,
                state: {
                    activeMap: {
                        stage: {
                            grid,
                            color: '#223344',
                        },
                    },
                },
                actions: {
                    activateMap: function({ state }, map) {
                        localVue.set(state, 'activeMap', map);
                    },
                },
            },
            live: {
                namespaced: true,
                actions: {
                    updateCampaignObject: jest.fn(),
                },
            },
        },
    };

    wrapper = mount(GridInterface, {
        localVue,
        store: new Vuex.Store(store),
    });
}

describe('GridInterface', () => {
    describe('It exists and renders.', () => {
        beforeEach(buildWrapper);
        it('Should exist as itself.', () => {
            expect(wrapper.getComponent(GridInterface)).toBeTruthy();
        });
    });
    describe('Buttons', () => {
        beforeEach(() => {
            buildWrapper();
        });
        describe('Grid Finder', () => {
            it('Should toggle grid finding state', async () => {
                const input = wrapper.find('.grid-finder-status input');
                expect(wrapper.vm.isGridFinding).toBeFalsy();
                await input.trigger('click');
                expect(wrapper.vm.isGridFinding).toBeTruthy();
                await input.trigger('click');
                expect(wrapper.vm.isGridFinding).toBeFalsy();
            });
        });
        describe('Snap To Grid', () => {
            it('Should toggle grid snapping state', async () => {
                const input = wrapper.find('.snap-to-grid-status input');
                expect(store.modules.live.actions.updateCampaignObject).toHaveBeenCalledTimes(0);
                await input.trigger('click');
                expect(store.modules.live.actions.updateCampaignObject).toHaveBeenCalledTimes(1);
                await input.trigger('click');
                expect(store.modules.live.actions.updateCampaignObject).toHaveBeenCalledTimes(2);
                store.modules.live.actions.updateCampaignObject.mockClear();
            });
        });
        describe('Show/Hide Grid', () => {
            it('Should make the grid visible or transparent.', async () => {
                const input = wrapper.find('.grid-visibility-status input');
                expect(store.modules.live.actions.updateCampaignObject).toHaveBeenCalledTimes(0);
                await input.trigger('click');
                expect(store.modules.live.actions.updateCampaignObject).toHaveBeenCalledTimes(1);
                await input.trigger('click');
                expect(store.modules.live.actions.updateCampaignObject).toHaveBeenCalledTimes(2);
                await input.trigger('click');
                expect(store.modules.live.actions.updateCampaignObject).toHaveBeenCalledTimes(3);
                store.modules.live.actions.updateCampaignObject.mockClear();
            });
        });
        describe('Tutorial', () => {
            it('Should not be open on start.', async () => {
                expect(wrapper.findComponent(TutorialModal).exists()).toBeFalsy();
            });
            it('Should open modal when clicked', async () => {
                await wrapper.find('.tutorial').trigger('click');
                expect(wrapper.findComponent(TutorialModal).exists()).toBeTruthy();
            });
        });
    });
});
