import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import VueKonva from 'vue-konva';
import _ from 'lodash';
import 'jest-canvas-mock';

import GridFinderLayer from '@/table/components/scene/GridFinderLayer.vue';
import GridStore from '@/core/grid/store.js';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(VueKonva);

let callsOn = 0;
let callsOff = 0;
function createStage(cursorPos) {
    return {
        getAbsoluteTransform: () => ({
            copy: () => ({
                invert: jest.fn(),
                point: pt => pt,
            }),
        }),
        getStage: () => ({
            getPointerPosition: () => cursorPos,
            on: () => callsOn++,
            off: () => callsOff++,
        }),
    };
}

describe('GridFinderLayer', () => {
    let store = {};

    function buildWrapper() {
        store = new Vuex.Store({
            modules: {
                grid: _.cloneDeep(GridStore),
            },
        });

        return shallowMount(GridFinderLayer, {
            propsData: {
                mapId: 'MAPID',
            },
            store,
            localVue,
        });
    }

    it('should render', () => {
        const wrapper = buildWrapper();
        const layer = wrapper.findComponent({ ref: 'gridfinder' });
        expect(layer.exists()).toBe(true);
    });

    it('should configure circle', () => {
        const wrapper = buildWrapper();
        const circle = wrapper.vm.config({ x: 10, y: 20, id: 5 });
        expect(circle).toEqual({
            fill: '#FF000000',
            id: 5,
            name: 'gridcircle',
            radius: 15,
            stroke: '#f14c27',
            strokeWidth: 6,
            x: 10,
            y: 20,
        });
    });

    it('should configure vertical line', () => {
        const wrapper = buildWrapper();
        const circle = wrapper.vm.verticalLineConfig({ x: 10, y: 20, id: 5 });
        expect(circle).toEqual({
            points: [10, -5, 10, 45],
            id: 5,
            name: 'centerlinevert',
            stroke: '#f14c27',
            strokeWidth: 2,
        });
    });

    it('should configure horizontal line', () => {
        const wrapper = buildWrapper();
        const circle = wrapper.vm.horizontalLineConfig({ x: 10, y: 20, id: 5 });
        expect(circle).toEqual({
            points: [-15, 20, 35, 20],
            id: 5,
            name: 'centerlinehoriz',
            stroke: '#f14c27',
            strokeWidth: 2,
        });
    });

    it('should add circle', async () => {
        const wrapper = buildWrapper();
        store.dispatch('grid/toggle');
        wrapper.vm.$refs.gridfinder.getNode = () => createStage({ x: 50, y: 100 });
        const event = { target: { attrs: { name: 'Name' } } };
        wrapper.vm.onClick(event);
        await localVue.nextTick();
        expect(wrapper.vm.circles).toEqual([
            {
                x: 50,
                y: 100,
                id: 1,
            },
        ]);
        expect(wrapper.emitted('changed')).toBeTruthy();
        callsOn = 0;
    });

    it('should remove circle when circle is clicked', () => {
        const wrapper = buildWrapper();
        wrapper.vm.$refs.gridfinder.getNode = () => createStage({ x: 50, y: 100 });
        wrapper.vm.addCircle();

        expect(wrapper.vm.circles).toEqual([
            {
                x: 50,
                y: 100,
                id: 1,
            },
        ]);

        const event = {
            evt: { preventDefault: () => {} },
            target: {
                attrs: {
                    id: 1,
                },
            },
        };
        wrapper.vm.circleClicked(event);

        expect(wrapper.vm.circles).toEqual([]);
        expect(wrapper.emitted('changed').length).toBe(2);
    });

    describe('Watcher', () => {
        describe('active', () => {
            it('calls on/off for stage when active toggles', async () => {
                const wrapper = buildWrapper(false);
                let stage = createStage({ x: 50, y: 100 });
                wrapper.vm.$refs.gridfinder.getNode = () => stage;
                store.dispatch('grid/toggle');
                await localVue.nextTick();
                expect(callsOn).toBe(1);
                store.dispatch('grid/toggle');
                await localVue.nextTick();
                expect(callsOff).toBe(1);
                callsOn = 0;
                callsOff = 0;
            });
        });
        describe('mapId', () => {
            it('resets properly when mapId changes', async () => {
                const wrapper = buildWrapper();
                store.dispatch('grid/toggle');
                wrapper.vm.circles = [
                    { x: 1, y: 1, id: 1 },
                    { x: 2, y: 2, id: 2 },
                    { x: 3, y: 3, id: 3 },
                    { x: 4, y: 4, id: 4 },
                ];
                await localVue.nextTick();
                wrapper.setProps({ mapId: 'NEWID' });
                await localVue.nextTick();
                expect(wrapper.vm.circles.length).toBe(0);
                expect(wrapper.vm.active).toBe(false);
                callsOn = 0;
            });
        });
    });
});
