import DiceMacro from '@/chat/components/dice/DiceMacro.vue';
import { shallowMount } from '@vue/test-utils';

describe('DiceMacro', () => {
    function buildWrapper(icon, text = '') {
        return shallowMount(DiceMacro, {
            propsData: {
                icon,
                text,
            },
        });
    }
    it('should render without an error', () => {
        const wrapper = buildWrapper();
        expect(wrapper.find('.die-macro').exists).toBeTruthy();
    });

    it('should use appropriate images for icon', () => {
        const wrapper = buildWrapper(4);
        expect(wrapper.find('.die-macro img').attributes('src')).toContain('d4');
    });

    it('should default to a d20 icon when none specified', () => {
        const wrapper = buildWrapper();
        expect(wrapper.find('.die-macro img').attributes('src')).toContain('d20');
    });

    it('should display text properly', () => {
        const wrapper = buildWrapper(4, 'Test Macro String');
        expect(wrapper.find('.die-macro div').text()).toContain('Test Macro String');
    });
});
