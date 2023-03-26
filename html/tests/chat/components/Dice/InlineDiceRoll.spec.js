import InlineDiceRoll from '@/chat/components/dice/InlineDiceRoll.vue';
import { shallowMount } from '@vue/test-utils';

describe('InlineDiceRoll', () => {
    function buildWrapper(rolls, formula = '', result = '') {
        return shallowMount(InlineDiceRoll, {
            propsData: {
                element: {
                    results: {
                        rolls,
                        formula,
                        result,
                    },
                },
            },
        });
    }

    it('should render without an error', () => {
        const wrapper = buildWrapper([]);
        expect(wrapper.find('.inline-dice-roll').exists).toBeTruthy();
    });

    it('has-dice when rolls are present', () => {
        const wrapper = buildWrapper([{}]);
        expect(wrapper.find('.inline-dice-roll').classes()).toContain('has-dice');
    });

    it('uses appropriate images', () => {
        const wrapper = buildWrapper([{ die: '20' }]);
        expect(wrapper.find('.dice-image').attributes('src')).toContain('d20');
    });

    it('highlights critical successes', () => {
        const wrapper = buildWrapper([{ die: 20, value: 20 }]);
        expect(wrapper.find('.inline-dice-roll').classes()).toContain('crit-success');
    });

    it('highlights critical failures', () => {
        const wrapper = buildWrapper([{ die: 20, value: 1 }]);
        expect(wrapper.find('.inline-dice-roll').classes()).toContain('crit-fail');
    });

    it('does not highlight critical failures on d1', () => {
        const wrapper = buildWrapper([{ die: 1, value: 1 }]);
        expect(wrapper.find('.inline-dice-roll').classes()).not.toContain('crit-fail');
    });

    it('uses d6 images', () => {
        const wrapper = buildWrapper([{ die: '6' }]);
        expect(wrapper.find('.dice-image').attributes('src')).toContain('d6');
    });

    it('uses d20 for all non-standard dice', () => {
        let wrapper = buildWrapper([{ die: '5' }]);
        expect(wrapper.find('.dice-image').attributes('src')).toContain('d20');
        wrapper = buildWrapper([{ die: '1' }]);
        expect(wrapper.find('.dice-image').attributes('src')).toContain('d20');
        wrapper = buildWrapper([{ die: '100' }]);
        expect(wrapper.find('.dice-image').attributes('src')).toContain('d20');
    });

    it('displays formula and results in text', () => {
        const wrapper = buildWrapper([{}], '1d20', '2');
        expect(wrapper.find('.inline-dice-roll').text()).toContain('1d20 = 2');
    });
});
