import Macro from '@/characters/components/character-editor/Macro.vue';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';

const localVue = createLocalVue();
localVue.use(Vuex);

describe('Macro', () => {
    let wrapper;

    function buildWrapper(macro = '', index = 0, context = {}, enableEditing = false) {
        const store = new Vuex.Store({
            modules: {
                profile: {
                    namespaced: true,
                    state: { me: { id: 1 } },
                },
                live: {
                    namespaced: true,
                    state: { director: { submitRoll: jest.fn() } },
                },
            },
        });
        return shallowMount(Macro, {
            propsData: { macro, index, context, enableEditing },
            localVue,
            store,
        });
    }

    beforeEach(() => (wrapper = buildWrapper()));

    it('should render without errors', () => {
        expect(wrapper.find('.text').exists()).toBeTruthy();
    });

    it('should render macro text', () => {
        wrapper = buildWrapper('test macro');
        expect(wrapper.find('.text').text()).toEqual('test macro');
    });

    describe('methods', () => {
        describe('triggerMacro', () => {
            it('should call submit roll in director', () => {
                wrapper.vm.triggerMacro();
                // TODO confirm that the live director has been sent a roll. This might want to wait until we conver the director to a store itself
            });
        });

        describe('events', () => {
            it('edit emits editing', () => {
                wrapper.vm.edit();
                expect(wrapper.emitted().editing).toBeTruthy();
            });

            it('save emits changed and editing', () => {
                wrapper.vm.save();
                expect(wrapper.emitted().changed).toBeTruthy();
                expect(wrapper.emitted().editing).toBeTruthy();
            });

            it('remove emits changed and editing', () => {
                wrapper.vm.remove();
                expect(wrapper.emitted().remove).toBeTruthy();
                expect(wrapper.emitted().editing).toBeTruthy();
            });

            it('cancel emits editing', () => {
                wrapper.vm.cancel();
                expect(wrapper.emitted().editing).toBeTruthy();
            });
        });
    });
});
