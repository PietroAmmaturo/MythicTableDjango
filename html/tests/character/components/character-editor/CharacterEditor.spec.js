import CharacterEditor from '@/characters/components/character-editor/CharacterEditor.vue';
import { mount } from '@vue/test-utils';
import Vue from 'vue';

describe('CharacterEditor', () => {
    it('should not render without original getter', () => {
        const wrapper = mount(CharacterEditor, {
            computed: {
                original: () => ({}),
            },
            stubs: { BaseModal: true },
        });
        expect(wrapper.find('div').exists()).toBeFalsy();
    });
    it('should render with original getter', async () => {
        const wrapper = mount(CharacterEditor, {
            computed: {
                original: () => ({
                    _id: 'foo',
                    _userid: 'bar',
                    image: '/image.png',
                    borderMode: 'coin',
                    borderColor: 'green',
                }),
                isTokenOwner: () => () => true,
                isGameMaster: () => true,
                hasPermissionFor: () => () => true,
            },
            stubs: { BaseModal: true },
        });
        // Trigger watcher
        wrapper.vm.$options.watch.original.call(wrapper.vm);
        await Vue.nextTick();
        expect(wrapper.find('div').exists()).toBeTruthy();
    });
});
