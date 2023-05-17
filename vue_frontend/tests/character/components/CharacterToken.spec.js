import CharacterToken from '@/characters/components/CharacterToken.vue';
import { shallowMount } from '@vue/test-utils';
import Vue from 'vue';

describe('CharacterToken', () => {
    it('should render without errors', () => {
        const wrapper = shallowMount(CharacterToken);

        expect(wrapper.find('div').exists()).toBeTruthy();
    });
    it('should render default properties', async () => {
        const wrapper = shallowMount(CharacterToken);
        wrapper.setProps({ ...wrapper.props(), image: '/test.png' });

        await Vue.nextTick();

        expect(wrapper.find('div.img').element.style.width).toBe('100px');
        expect(wrapper.find('div.img').element.style.height).toBe('100px');
        expect(wrapper.find('div.img').element.style.backgroundImage).toBe('url(/test.png)');

        expect(wrapper.find('div.circleClass').element.style.background).toContain('rgb(28, 28, 28)');

        expect(wrapper.find('div.squareMode').exists()).toBeTruthy();
    });
    it('should render specified properties', async () => {
        const wrapper = shallowMount(CharacterToken);
        wrapper.setProps({
            image: 'hello.png',
            mode: 'circle',
            color: 'pink',
            size: '999px',
        });

        await Vue.nextTick();

        expect(wrapper.find('div.img').element.style.width).toBe('999px');
        expect(wrapper.find('div.img').element.style.height).toBe('999px');
        expect(wrapper.find('div.img').element.style.backgroundImage).toBe('url(hello.png)');

        expect(wrapper.find('div.circleClass').element.style.background).toContain('pink');

        expect(wrapper.find('div.circleMode').exists()).toBeTruthy();
    });
});
