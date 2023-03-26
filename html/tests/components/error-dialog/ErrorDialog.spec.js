import { mount } from '@vue/test-utils';

import ErrorDialog from '@/common/components/ErrorDialog.vue';

let wrapper;

function buildWrapper(computed) {
    wrapper = mount(ErrorDialog, {
        computed,
        stubs: {
            BaseModal: true,
        },
    });
}

describe('ErrorDialog', () => {
    it('should not render if message is empty', () => {
        buildWrapper({ message: () => '' });
        expect(wrapper.find('.container').exists()).toBeFalsy();
    });
    it('should render if message is not empty', () => {
        buildWrapper({ message: () => 'something' });
        expect(wrapper.find('.container').exists()).toBeTruthy();
        expect(wrapper.find('.message').text()).toMatch('something');
    });
});
