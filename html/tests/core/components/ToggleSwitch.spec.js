import { mount } from '@vue/test-utils';

import ToggleSwitch from '@/core/components/ToggleSwitch.vue';

let wrapper;
let propsData;
let checkbox;
let container;
let indicator;

function buildWrapper() {
    propsData = {
        elementId: 'idProp',
        checked: false,
        toggleChecked: () => (propsData.checked = !propsData.checked),
        checkedColor: '#007bff',
        uncheckedColor: '#6c757d',
        isDisabled: false,
    };
    wrapper = mount(ToggleSwitch, { propsData });
    checkbox = wrapper.find('#idProp');
    container = wrapper.find('[for="idProp"]');
    indicator = wrapper.find('.toggle div');
}

describe('ToggleSwitch', () => {
    beforeEach(buildWrapper);
    describe('Existence.', () => {
        it('Is a mounted version of expected component.', () => {
            expect(wrapper.findComponent(ToggleSwitch).exists()).toBe(true);
        });
    });
    describe('Properties', () => {
        describe('id', () => {
            it('Should add the id to the input and label(for)', () => {
                expect(wrapper.find('[for="idProp"]').exists()).toBe(true);
                expect(wrapper.find('#idProp').exists()).toBe(true);
            });
        });
        describe('isDisabled', () => {
            it('Should apply disabled class and disable checkbox when true.', async () => {
                await wrapper.setProps({ ...propsData, isDisabled: true });
                expect(wrapper.find('[for="idProp"]').classes('disabled')).toBe(true);
                expect(wrapper.find('#idProp').attributes('disabled')).toBe('disabled');
            });
        });
    });
    describe('User interaction', () => {
        describe('Click component', () => {
            it('Should reflected the checked value', () => {
                expect(checkbox.element.checked).toBe(false);
            });
            it('Should change the value when component is clicked', async () => {
                await container.trigger('click');
                expect(checkbox.element.checked).toBe(true);
            });
            it('Should render with given background color (unchecked).', () => {
                expect(checkbox.element.checked).toBe(false);
                expect(container.element.style.background).toBe('rgb(108, 117, 125)');
                expect(indicator.element.style.background).toBe('rgb(108, 117, 125)');
            });
            it('Should render with given background color (checked).', async () => {
                await wrapper.setProps({ ...propsData, checked: true });
                expect(checkbox.element.checked).toBe(true);
                expect(container.element.style.background).toBe('rgb(0, 123, 255)');
                expect(indicator.element.style.background).toBe('rgb(0, 123, 255)');
            });
            it('Indicator should move when activated.', async () => {
                expect(indicator.element.style.left).toBe('1px');
                await wrapper.setProps({ ...propsData, checked: true });
                expect(indicator.element.style.right).toBe('1px');
            });
        });
    });
});
