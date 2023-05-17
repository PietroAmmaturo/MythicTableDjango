import { mount } from '@vue/test-utils';

import HeaderExpandedToolbar from '@/table/components/play-view/Header/HeaderExpandedToolbar.vue';

describe('HeaderExpandedToolbar.vue', () => {
    let wrapper;
    let propsData;
    const noAction = {
        title: 'Image title.',
        titleImageLocation: '/static/icons/layout/close.svg',
    };
    const withAction = {
        title: 'Image title.',
        titleImageLocation: '/static/icons/layout/close.svg',
        actionImageLocation: '/static/icons/layout/draw.svg',
        status: true,
    };

    function buildWrapper(props) {
        propsData = props;
        wrapper = mount(HeaderExpandedToolbar, { propsData });
    }

    describe('The component renders as expected.', () => {
        beforeEach(() => buildWrapper(noAction));
        test('Component exists.', () => {
            expect(wrapper.exists()).toBeTruthy();
        });
        test('The wrapper is the component.', () => {
            expect(wrapper.is(HeaderExpandedToolbar)).toBeTruthy();
        });
        test('Does not render additional action if it does not receive one.', () => {
            expect(wrapper.findAll('.header-panel-icons img').length).toBe(1);
        });
        test('Does render additional action if it receives one.', async () => {
            await wrapper.setProps(withAction);
            expect(wrapper.findAll('.header-panel-icons img').length).toBe(2);
        });
    });
    describe('Methods', () => {
        describe('closePanel', () => {
            test('Emits when called.', () => {
                buildWrapper(noAction);
                wrapper.vm.closePanel();
                expect(wrapper.emitted('close')).toBeTruthy();
            });
            test('Emits when triggered by user.', () => {
                buildWrapper(noAction);
                let button = wrapper.find('.header-panel-icons img');
                button.trigger('click');
                expect(wrapper.emitted('close')).toBeTruthy();
            });
        });
        describe('action', () => {
            test('Emits when called.', () => {
                buildWrapper(withAction);
                wrapper.vm.action();
                expect(wrapper.emitted('action')).toBeTruthy();
            });
            test('Emits when triggered by user.', () => {
                buildWrapper(withAction);
                let buttons = wrapper.findAll('.header-panel-icons img');
                buttons.at(1).trigger('click');
                expect(wrapper.emitted('action')).toBeTruthy();
            });
        });
        describe('X button on panel.', () => {
            test('Emits when triggered by user.', () => {
                buildWrapper(noAction);
                let xButton = wrapper.find('button.close-header-panel');
                xButton.trigger('click');
                expect(wrapper.emitted('close')).toBeTruthy();
            });
        });
    });
});
