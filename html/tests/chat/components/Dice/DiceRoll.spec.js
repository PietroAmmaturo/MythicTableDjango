import DiceRoll from '@/chat/components/dice/DiceRoll.vue';
import Die from '@/chat/components/dice/DieResult.vue';

import { shallowMount } from '@vue/test-utils';

describe('DiceMacro', () => {
    function buildWrapper(showResult, dice = { rolls: [] }) {
        return shallowMount(DiceRoll, {
            propsData: {
                dice,
                showResult,
            },
        });
    }

    it('should show the result by default', () => {
        let wrapper = buildWrapper();
        expect(wrapper.find('.result').exists()).toBeTruthy();
    });

    it('should hide the result', () => {
        let wrapper = buildWrapper(false);
        expect(wrapper.find('.result').exists()).toBeFalsy();
    });

    it('should display the formula', () => {
        let wrapper = buildWrapper(true, { rolls: [], formula: '1d20' });
        expect(wrapper.find('.formula').text()).toContain('1d20');
    });

    it('should display mutliple', () => {
        let wrapper = buildWrapper(true, { rolls: [4, 6], formula: '2d10' });
        expect(wrapper.findAll(Die).length).toEqual(2);
    });
});
