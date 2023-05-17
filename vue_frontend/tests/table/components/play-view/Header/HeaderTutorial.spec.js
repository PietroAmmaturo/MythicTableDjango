import { mount } from '@vue/test-utils';

import TutorialModal from '@/core/components/TutorialModal.vue';

let wrapper;
function buildWrapper() {
    let stubs = { BaseModal: true };
    wrapper = mount(TutorialModal, { stubs });
}

describe('TutorialModal', () => {
    beforeEach(buildWrapper);
    it('Renders as itself.', () => {
        expect(wrapper.findComponent(TutorialModal).exists()).toBeTruthy();
    });
    it('Emits when close button is clicked', () => {
        wrapper.find('.modal-button').trigger('click');
        expect(wrapper.emitted().close.length).toBe(1);
    });
});
