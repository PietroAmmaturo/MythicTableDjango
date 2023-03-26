import ChatInput from '@/chat/components/ChatInput.vue';
import { shallowMount } from '@vue/test-utils';

describe('ChatInput', () => {
    function buildWrapper() {
        return shallowMount(ChatInput);
    }

    it('should have input', () => {
        const wrapper = buildWrapper();
        expect(wrapper.contains('input')).toBeTruthy();
    });

    // Before testing this component we should fix how it communicates with the director
    // Currently we would only really want to test the mthods to make sure they are calling
    // it's dependencies as we expect, but we are currently heavily coupled. We should
    // remove that coupleing by not directly accessing and invoking methods of the director
    // Instead, we should be calling actions in the director.
});
