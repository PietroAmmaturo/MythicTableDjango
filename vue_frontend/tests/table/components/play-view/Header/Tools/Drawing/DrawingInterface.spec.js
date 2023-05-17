import { mount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';

import DrawingInterface from '@/table/components/play-view/Header/Tools/Drawing/DrawingInterface.vue';
import DrawingSelector from '@/table/components/play-view/Header/Tools/Drawing/DrawingSelector.vue';

const localVue = createLocalVue();
localVue.use(Vuex);

describe('DrawingInterface', () => {
    let wrapper;
    let state;
    let store;

    function buildWrapper() {
        state = {
            drawingColors: ['#d8d8f6', '#21a0a0', '#1ba73e', '#8b2635'],
            activeColor: '#d8d8f6',
            brushSizes: [5, 10, 15],
            activeBrushSize: 5,
            brushRenderSizeModifier: 5,
        };
        store = new Vuex.Store({
            modules: {
                drawing: {
                    namespaced: true,
                    state,
                },
            },
        });

        wrapper = mount(DrawingInterface, {
            store,
            localVue,
        });
    }
    describe('Component renders without error.', () => {
        test('Component exists as the component.', () => {
            buildWrapper();
            expect(wrapper.exists()).toBeTruthy();
            expect(wrapper.is(DrawingInterface)).toBeTruthy();
        });
        describe('Children components rendered.', () => {
            buildWrapper();
            let drawingSelectors = wrapper.findAllComponents(DrawingSelector);
            test('DrawingSelector exists.', () => {
                expect(drawingSelectors.at(0).exists()).toBeTruthy();
            });
            test('Expected amount of DrawingSelectors render.', () => {
                expect(drawingSelectors).toHaveLength(7);
            });
        });
    });
    describe('Children given information as expected.', () => {
        buildWrapper();
        let drawingSelectors = wrapper.findAllComponents(DrawingSelector);
        describe('Color selectors.', () => {
            test('Color is active in state.', () => {
                const selectedColor = drawingSelectors.at(0);
                expect(selectedColor.props().color).toBe(state.activeColor);
                expect(selectedColor.props().selected).toBe(true);
            });
            test('Color is not active in state.', () => {
                const selectedColor = drawingSelectors.at(1);
                expect(selectedColor.props().color).not.toBe(state.activeColor);
                expect(selectedColor.props().selected).toBe(false);
            });
        });
        describe('Size selectors.', () => {
            test('Size is active in state.', () => {
                const activeSize = `${state.activeBrushSize + state.brushRenderSizeModifier}px`;
                const selectedSize = drawingSelectors.at(4);
                expect(selectedSize.props().size).toBe(activeSize);
                expect(selectedSize.props().selected).toBe(true);
            });
            test('Size is not active in state.', () => {
                const activeSize = `${state.activeBrushSize + state.brushRenderSizeModifier}px`;
                const selectedSize = drawingSelectors.at(5);
                expect(selectedSize.props().size).not.toBe(activeSize);
                expect(selectedSize.props().selected).toBe(false);
            });
        });
    });
});
