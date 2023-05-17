import CharacterDescriptionEditor from '@/characters/components/character-editor/CharacterDescriptionEditor.vue';
import Macro from '@/characters/components/character-editor/Macro.vue';
import Draggable from 'vuedraggable';
import { shallowMount } from '@vue/test-utils';

describe('CharacterDescriptionEditor', () => {
    let wrapper;

    function buildWrapper(macros) {
        const props = {
            value: {
                name: 'foo',
                description: 'bar',
            },
        };
        if (macros) {
            props.value.macros = macros;
        }
        return shallowMount(CharacterDescriptionEditor, {
            propsData: props,
        });
    }

    beforeEach(() => (wrapper = buildWrapper()));

    it('should render without errors', () => {
        expect(wrapper.find('div').exists()).toBeTruthy();
        expect(wrapper.findComponent(Draggable).exists()).toBeTruthy();
    });
    it('should render content for given props', () => {
        expect(wrapper.find('.details input').element.value).toMatch('foo');
        expect(wrapper.find('.expand textarea').element.value).toMatch('bar');
    });

    describe('context', () => {
        it('should render a macro', () => {
            wrapper = buildWrapper({
                macros: ['test macro'],
            });
            expect(wrapper.findComponent(Macro).exists()).toBeTruthy();
        });
    });

    describe('methods', () => {
        describe('addMacro', () => {
            it('should add a macro', () => {
                const button = wrapper.find('.add-macro');
                button.trigger('click');
                // TODO - expect(wrapper.findComponent(Macro).exists()).toBeTruthy();  // This should work, but I don't know why it doesn't
                expect(wrapper.vm.modified.macros).toHaveLength(1);
            });
        });

        describe('toggleMacroDrag', () => {
            it('should toggle Draggable', () => {
                wrapper.vm.toggleMacroDrag();
                // TODO - Validate wrapper.findComponent(Draggable) is disabled
            });
        });

        describe('macroChange', () => {
            it('should change order', () => {
                const button = wrapper.find('.add-macro');
                button.trigger('click');
                wrapper.vm.macroChange({ index: 0, edited: 'test 2' });
                // TODO validate something
            });
        });

        describe('macroDelete', () => {
            it('should remove a macro', () => {
                const button = wrapper.find('.add-macro');
                button.trigger('click');
                wrapper.vm.macroDelete(0);
                // TODO validate something
            });
        });
    });
});
