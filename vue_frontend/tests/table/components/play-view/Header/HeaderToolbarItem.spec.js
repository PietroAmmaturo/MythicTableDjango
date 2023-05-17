import { mount } from '@vue/test-utils';

import HeaderToolbarItem from '@/table/components/play-view/Header/HeaderToolbarItem.vue';

describe('HeaderToolbarItem', () => {
    let wrapper;
    const props = {
        imageLocation: '/static/layout/image.svg',
        name: 'Display Name',
    };

    function buildWrapper() {
        wrapper = mount(HeaderToolbarItem, {
            propsData: {
                ...props,
            },
        });
    }

    describe('Component renders as expected.', () => {
        beforeEach(() => buildWrapper());
        test('Component renders.', () => {
            expect(wrapper.exists()).toBeTruthy();
        });
        test('Wrapper is the component.', () => {
            expect(wrapper.is(HeaderToolbarItem)).toBeTruthy();
        });
        describe('Name/Description of toolbar item.', () => {
            let nameBanner;
            beforeEach(() => {
                buildWrapper();
                nameBanner = wrapper.find('h4');
            });
            test('Has the correct text.', () => {
                expect(nameBanner.text()).toBe(props.name);
            });
            test('When not hovered over, cannot see the name.', () => {
                expect(nameBanner.isVisible()).toBeFalsy();
            });
            test('When hovered over, can see the name.', async () => {
                await wrapper.trigger('mouseover');
                expect(nameBanner.isVisible()).toBeTruthy();
            });
        });
    });
    describe('Methods.', () => {
        describe('onClick', () => {
            beforeEach(() => buildWrapper());
            test('When called it emits.', () => {
                wrapper.vm.onClick();
                expect(wrapper.emitted('clicked')).toBeTruthy();
            });
            test('Emits when triggered by user.', () => {
                wrapper.trigger('click');
                expect(wrapper.emitted('clicked')).toBeTruthy();
            });
        });
    });
});
