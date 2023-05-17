import { mount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import _ from 'lodash';

import FogInterface from '@/table/components/play-view/Header/Tools/FogInterface.vue';
import FogStore from '@/core/fog/store.js';

const localVue = createLocalVue();
localVue.use(Vuex);

let wrapper;
let updateSpy;
function buildWrapper() {
    updateSpy = jest.fn();
    let store = new Vuex.Store({
        modules: {
            fog: _.cloneDeep(FogStore),
            gamestate: {
                namespaced: true,
                state: {
                    activeMap: {
                        _id: 'mapId',
                        stage: {
                            fog: {
                                shapes: [
                                    { konvaComponent: 'v-rect', config: {} },
                                    { konvaComponent: 'v-rect', config: {} },
                                ],
                            },
                        },
                    },
                    mapShapes: [{ stateShape: 1 }, { stateShape: 2 }],
                },
            },
            collections: {
                namespaced: true,
                actions: {
                    update: updateSpy,
                },
            },
        },
    });
    wrapper = mount(FogInterface, { localVue, store });
}

describe('FogInterface', () => {
    beforeEach(buildWrapper);
    describe('Existence.', () => {
        it('Should exist as itself', () => {
            expect(wrapper.findComponent(FogInterface).exists()).toBe(true);
        });
    });
    describe('User interface.', () => {
        describe('Obscure/Reveal buttons.', () => {
            let revealButton;
            let obscureButton;
            beforeEach(() => {
                revealButton = wrapper.find('#reveal');
                obscureButton = wrapper.find('#obscure');
            });
            it('Should change to revealing when clicked.', async () => {
                await revealButton.trigger('click');
                expect(wrapper.vm.willObscure).toBe(false);
                expect(revealButton.classes('active')).toBe(true);
            });
            it('Should change to obscuring when revealing is active.', async () => {
                await revealButton.trigger('click');
                expect(wrapper.vm.willObscure).toBe(false);
                await obscureButton.trigger('click');
                expect(wrapper.vm.willObscure).toBe(true);
                expect(obscureButton.classes('active')).toBe(true);
            });
        });
        describe('Obscure All', () => {
            it('Should create a shape the size of the map on click.', async () => {
                await wrapper.find('#obscure-all').trigger('click');
                expect(updateSpy).toHaveBeenCalledWith(expect.anything(), {
                    collection: 'maps',
                    id: 'mapId',
                    patch: expect.any(Array),
                });
            });
        });
        describe('Reveal All', () => {
            it('Should create a shape the size of the map on click.', async () => {
                await wrapper.find('#reveal-all').trigger('click');
                expect(updateSpy).toHaveBeenCalledWith(expect.anything(), {
                    collection: 'maps',
                    id: 'mapId',
                    patch: expect.any(Array),
                });
            });
        });
    });
});
