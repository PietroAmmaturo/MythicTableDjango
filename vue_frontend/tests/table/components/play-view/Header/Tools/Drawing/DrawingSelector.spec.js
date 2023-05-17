import { mount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';

import DrawingSelector from '@/table/components/play-view/Header/Tools/Drawing/DrawingSelector.vue';

const localVue = createLocalVue();
localVue.use(Vuex);

describe('DrawingSelector', () => {
    let wrapper;
    let actions;
    let store;
    const colorProps = {
        color: '#ffffff',
        size: '1.5rem',
        dispatchTo: 'drawing/updateColor',
        selected: false,
    };
    const sizeProps = {
        color: '#20c997',
        size: '16px',
        dispatchTo: 'drawing/updateBrushSize',
        selected: false,
    };

    function buildWrapper(props) {
        actions = {
            'drawing/updateColor': jest.fn(),
            'drawing/updateBrushSize': jest.fn(),
        };
        store = new Vuex.Store({ actions });
        wrapper = mount(DrawingSelector, {
            propsData: props,
            store,
            localVue,
        });
    }

    describe('Component renders.', () => {
        buildWrapper(colorProps);
        test('The component exists.', () => expect(wrapper.is(DrawingSelector)).toBeTruthy());
    });
    describe('Computed: ', () => {
        describe('baseCircleStyle', () => {
            describe('Color rendering', () => {
                beforeEach(() => buildWrapper(colorProps));
                test('Background color matches prop.', () => {
                    // backgroundColor converts to RGB. Not all color selectors do.
                    expect(wrapper.element.style.backgroundColor).toBe('rgb(255, 255, 255)');
                });
                test('Background color does not match prop when selected.', () => {
                    buildWrapper({ ...colorProps, selected: true });
                    // backgroundColor converts to RGB. Not all color selectors do.
                    expect(wrapper.element.style.backgroundColor).not.toBe('rgb(255, 255, 255)');
                });
                test('Border color matches prop.', () => {
                    expect(wrapper.element.style.borderColor).toBe('#ffffff');
                });
                test('Border color still matches prop when selected.', () => {
                    buildWrapper({ ...colorProps, selected: true });
                    expect(wrapper.element.style.borderColor).toBe('#ffffff');
                });
            });
            describe('Size rendering', () => {
                beforeEach(() => buildWrapper(sizeProps));
                test('Width of element should be given size.', () => {
                    expect(wrapper.element.style.width).toBe(sizeProps.size);
                });
                test('Height of element should be given size.', () => {
                    expect(wrapper.element.style.height).toBe(sizeProps.size);
                });
            });
        });
    });
    describe('Methods: ', () => {
        describe('handleSelect', () => {
            test('Dispatch to update color with color.', () => {
                buildWrapper(colorProps);
                wrapper.vm.handleSelect();
                expect(actions[colorProps.dispatchTo]).toHaveBeenCalledWith(expect.anything(), colorProps.color);
                actions[colorProps.dispatchTo].mockRestore();
            });
            test('Dispatch to brush size with size.', () => {
                buildWrapper(sizeProps);
                wrapper.vm.handleSelect();
                expect(actions[sizeProps.dispatchTo]).toHaveBeenCalledWith(expect.anything(), sizeProps.size);
                actions[sizeProps.dispatchTo].mockRestore();
            });
            test('Trigger method from user interaction.', () => {
                wrapper.trigger('click');
                expect(actions[sizeProps.dispatchTo]).toHaveBeenCalledTimes(1);
                actions[sizeProps.dispatchTo].mockRestore();
            });
        });
    });
});
