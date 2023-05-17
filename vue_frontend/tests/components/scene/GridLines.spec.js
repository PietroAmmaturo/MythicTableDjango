import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import VueKonva from 'vue-konva';

import GridLines from '@/table/components/scene/GridLines.vue';
import GridStore from '@/core/grid/store';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(VueKonva);

const store = new Vuex.Store({
    modules: {
        grid: GridStore,
        window: {
            namespaced: true,
            state: {
                windowSize: {
                    width: 500,
                    height: 500,
                },
            },
        },
    },
});

jest.mock('@/table/components/scene/grid/render', () => ({
    renderGridTile: jest.fn().mockReturnValue({
        canvas: {},
        offset: { x: 0, y: 0 },
    }),
}));

describe('GridLines component', () => {
    function buildWrapper(props = { gridConfig: {} }) {
        return shallowMount(GridLines, {
            propsData: {
                stageScale: 1,
                ...props,
            },
            localVue,
            store,
        });
    }

    beforeEach(() => {
        store.dispatch('grid/reset');
    });

    it('should render', () => {
        const wrapper = buildWrapper();
        const grid = wrapper.find({ ref: 'grid' });
        expect(grid).toBeDefined();
    });

    it('should be visible when grid finding is on', () => {
        const wrapper = buildWrapper({ gridConfig: { visible: false } });
        store.dispatch('grid/toggle');
        expect(wrapper.vm.visible).toBeTruthy();
    });

    it('should not be visible when grid config is off', () => {
        const wrapper = buildWrapper({ gridConfig: { visible: false } });
        expect(wrapper.vm.visible).toBeFalsy();
    });

    it('should be visible when grid config is on', () => {
        const wrapper = buildWrapper({ gridConfig: { visible: true } });
        expect(wrapper.vm.visible).toBeTruthy();
    });

    it('should be visible when grid config has no visibility', () => {
        const wrapper = buildWrapper({ gridConfig: {} });
        expect(wrapper.vm.visible).toBeTruthy();
    });
});
