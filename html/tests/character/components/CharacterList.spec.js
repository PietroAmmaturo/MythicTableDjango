import { createLocalVue, mount } from '@vue/test-utils';
import Vuex from 'vuex';

import CharacterItem from '@/characters/components/character-library/CharacterItem.vue';
import CharacterList from '@/characters/components/character-library/CharacterList.vue';

const localVue = createLocalVue();
localVue.use(Vuex);

describe('CharacterList', () => {
    let wrapper;
    let actions;

    function buildWrapper(data = {}) {
        actions = {
            'dropper/startDrag': jest.fn(),
            'dropper/reset': jest.fn(),
        };
        let store = new Vuex.Store({
            actions,
        });
        wrapper = mount(CharacterList, {
            ...data,
            store,
            localVue,
        });
    }

    const props = {
        propsData: {
            characters: [{ _id: 'id', name: 'name', image: 'image' }],
        },
    };

    afterEach(() => jest.clearAllMocks());

    it('Component renders by finding class.', () => {
        buildWrapper();
        expect(wrapper.find('.character-list').exists()).toBeTruthy();
    });

    describe('Handle presence of characters', () => {
        beforeEach(() => buildWrapper());

        it('Not given characters, no characters should render.', () => {
            expect(wrapper.findComponent(CharacterItem).exists()).toBeFalsy();
        });

        it('Given characters, characters should render.', () => {
            wrapper.setProps(props.propsData);
            expect(wrapper.findComponent(CharacterItem)).toBeTruthy();
        });
    });

    describe('Methods (with characters only)', () => {
        beforeEach(() => buildWrapper(props));

        it('Method triggers dispatch for starting drag.', () => {
            wrapper.vm.dragStart({ target: { id: 'id' } });
            expect(actions['dropper/startDrag']).toHaveBeenCalledWith(expect.anything(), props.propsData.characters[0]);
        });

        it('Triggering dragStart method from user action.', () => {
            wrapper.findComponent(CharacterItem).trigger('dragstart');
            expect(actions['dropper/startDrag']).toHaveBeenCalledTimes(1);
        });

        it('Method triggers dispatch for ending drag (aka drop).', () => {
            wrapper.vm.drop();
            expect(actions['dropper/reset']).toHaveBeenCalled();
        });

        it('Triggering drop method from user action.', () => {
            wrapper.findComponent(CharacterItem).trigger('drop');
            expect(actions['dropper/reset']).toHaveBeenCalledTimes(1);
        });
    });
});
