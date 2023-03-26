import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';

import EditorWindow from '@/maps/components/EditorWindow.vue';

const localVue = createLocalVue();
localVue.use(Vuex);

describe('MapEditor', () => {
    function buildWrapper(params = {}) {
        const state = {
            me: { id: 1 },
        };
        const store = new Vuex.Store({
            modules: {
                profile: {
                    namespaced: true,
                    state,
                },
            },
        });
        return shallowMount(EditorWindow, {
            ...params,
            localVue,
            store,
        });
    }

    it('should render', () => {
        const wrapper = buildWrapper();
        expect(wrapper.contains('div')).toBeTruthy();
    });
});
