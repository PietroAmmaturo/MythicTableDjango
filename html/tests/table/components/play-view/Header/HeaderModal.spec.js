import { mount } from '@vue/test-utils';

import HeaderModal from '@/table/components/play-view/Header/HeaderModal.vue';

describe('HeaderModal', () => {
    let wrapper;
    const props = {
        title: 'Test',
        message: 'Testing',
        focusButton: 'Focus Test',
        focusAction: jest.fn(),
        notFocusButton: 'Not Focus Test',
        notFocusAction: jest.fn(),
    };
    const stubs = { BaseModal: true };

    function buildWrapper() {
        wrapper = mount(HeaderModal, {
            stubs,
            propsData: props,
        });
    }

    beforeEach(buildWrapper);
    afterEach(() => {
        props.focusAction.mockClear();
        props.notFocusAction.mockClear();
    });
    it('Renders as itself', () => {
        expect(wrapper.getComponent(HeaderModal)).toBeTruthy();
    });
    describe('Buttons', () => {
        describe('focusButton', () => {
            it('Calls focus action and emits when clicked.', async () => {
                await wrapper
                    .findAll('button')
                    .at(1)
                    .trigger('click');
                expect(props.focusAction).toHaveBeenCalledTimes(1);
                expect(wrapper.emitted().close.length).toBe(1);
            });
            it('Functions without prop', async () => {
                wrapper = mount(HeaderModal, { stubs });
                await wrapper
                    .findAll('button')
                    .at(1)
                    .trigger('click');
                expect(wrapper.vm.focusAction()).toBe(null);
                expect(wrapper.emitted().close.length).toBe(1);
            });
        });
        describe('notFocusButton', () => {
            it('Calls focus action and emits when clicked.', async () => {
                await wrapper
                    .findAll('button')
                    .at(0)
                    .trigger('click');
                expect(props.notFocusAction).toHaveBeenCalledTimes(1);
                expect(wrapper.emitted().close.length).toBe(1);
            });
            it('Functions without prop.', async () => {
                wrapper = mount(HeaderModal, { stubs });
                await wrapper
                    .findAll('button')
                    .at(0)
                    .trigger('click');
                expect(wrapper.vm.notFocusAction()).toBe(null);
                expect(wrapper.emitted().close.length).toBe(1);
            });
        });
    });
});
