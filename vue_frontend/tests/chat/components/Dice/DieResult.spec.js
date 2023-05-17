import Die from '@/chat/components/dice/DieResult.vue';

import { shallowMount } from '@vue/test-utils';

describe('DieResult', () => {
    function buildWrapper(die, value, index = 0) {
        return shallowMount(Die, {
            propsData: {
                roll: { die, value },
                index,
            },
        });
    }

    it('should show the result by default', () => {
        let wrapper = buildWrapper(6, 4);
        expect(wrapper.find('img').exists()).toBeTruthy();
        expect(wrapper.find('img').attributes('src')).toContain('d6');
        expect(wrapper.find('.die').text()).toEqual('4');
    });

    it('should show critical', () => {
        let wrapper = buildWrapper(20, 20);
        expect(wrapper.find('.crit-success').exists()).toBeTruthy();
    });

    it('should show critical failure', () => {
        let wrapper = buildWrapper(20, 1);
        expect(wrapper.find('.crit-fail').exists()).toBeTruthy();
    });
});
