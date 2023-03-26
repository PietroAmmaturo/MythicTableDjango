import CharacterList from '@/characters/components/character-library/CharacterList.vue';
import Character from '@/characters/components/character-library/CharacterLibrary.vue';
import { shallowMount } from '@vue/test-utils';

describe('Character', () => {
    it('should render without an error', () => {
        const wrapper = shallowMount(Character, {
            computed: {
                selectedTokenId: () => null,
                director: () => null,
                connected: () => null,
                characters: () => null,
            },
        });
        expect(wrapper.contains(CharacterList)).toBeTruthy();
    });
});
