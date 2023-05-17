import { shallowMount } from '@vue/test-utils';
import Vue from 'vue';

import CharacterTokenEditor from '@/characters/components/character-editor/CharacterTokenEditor.vue';

describe('CharacterTokenEditor', () => {
    let wrapper;

    function buildWrapper(editValues = {}) {
        return shallowMount(CharacterTokenEditor, {
            propsData: {
                value: {
                    borderMode: 'coin',
                    borderColor: '#ffffff',
                    tokenSize: '2',
                    ...editValues,
                },
            },
        });
    }

    beforeEach(() => (wrapper = buildWrapper()));

    describe('Rendering checks', () => {
        it('Should render, checked by class.', () => {
            expect(wrapper.find('.token-editor').exists()).toBeTruthy();
        });

        it('Should render selections, with given props.', () => {
            expect(findTokenShape(wrapper)).toMatch('Coin');
            expect(findBackgroundColor(wrapper)).toMatch('rgb(255, 255, 255)');
            expect(findSize(wrapper)).toMatch('Medium');
        });

        it('Should render selections, given different props', async () => {
            let values = {
                borderMode: 'square',
                borderColor: '#000000',
                tokenSize: '3',
            };
            wrapper.setProps({ value: { ...values } });

            await Vue.nextTick();

            expect(findTokenShape(wrapper)).toMatch('Square');
            expect(findBackgroundColor(wrapper)).toMatch('rgb(0, 0, 0)');
            expect(findSize(wrapper)).toMatch('Large');
        });

        function findTokenShape(wrapper) {
            return wrapper.find('.mode-selector .active').text();
        }

        function findBackgroundColor(wrapper) {
            return wrapper.find('.color-selector .active').element.style.backgroundColor;
        }

        function findSize(wrapper) {
            return wrapper.find('.sizeSelector .active').text();
        }
    });

    describe('Computed property `modified` emit events', () => {
        it('Emits when token properties are modified.', () => {
            wrapper.vm.modified = {
                ...wrapper.vm.modified,
                borderMode: 'square',
            };
            expect(wrapper.emitted().input).toBeTruthy();
        });

        const userClickTest = (method, selector) => {
            const methodSpy = jest.spyOn(CharacterTokenEditor.methods, method);
            wrapper = buildWrapper();
            wrapper.find(selector).trigger('click');
            expect(methodSpy).toHaveBeenCalledTimes(1);
            methodSpy.mockRestore();
        };

        describe('setMode, (style in UI)', () => {
            it('Triggers computation.', () => {
                wrapper.vm.setMode('tile');
                expect(wrapper.emitted().input).toBeTruthy();
            });

            it('User click triggers associated method.', () => {
                userClickTest('setMode', '.mode-selector :nth-child(2)');
            });
        });
        describe('selectColor', () => {
            it('Triggers computation.', () => {
                wrapper.vm.selectColor('#000000');
                expect(wrapper.emitted().input).toBeTruthy();
            });

            it('User click triggers associated method.', () => {
                userClickTest('selectColor', '.color-selector :nth-child(2)');
            });
        });
        describe('selectSize', () => {
            it('Triggers computation.', () => {
                const size = { id: '3' };
                wrapper.vm.selectSize('click', size);
                expect(wrapper.emitted().input).toBeTruthy();
            });

            it('User click triggers associated method.', () => {
                userClickTest('selectSize', '.sizeSelector :nth-child(2)');
            });
        });
        describe('setIcon', () => {
            it('Triggers computation.', () => {
                wrapper.vm.setIcon('2');
                expect(wrapper.emitted().input).toBeTruthy();
            });
            // Further use of this method is inside a child component.
        });
    });
});
