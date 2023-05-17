import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import VueKonva from 'vue-konva';
import _ from 'lodash';

import FogLayer from '@/core/fog/components/FogLayer.vue';
import FogStore from '@/core/fog/store.js';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(VueKonva);

let wrapper;
let store;
let userId = 'myId';
let hasPermissionReturnValue = true;

let pointerSpy;
let shapeSetterSpy;
let updateSpy;
const hexColorRegex = /^#(?:[0-9a-fA-F]{3,4}){1,2}$/;

function buildWrapper() {
    updateSpy = jest.fn();
    store = new Vuex.Store({
        modules: {
            fog: _.cloneDeep(FogStore),
            profile: {
                namespaced: true,
                state: {
                    me: {
                        id: 'myId',
                    },
                },
            },
            gamestate: {
                namespaced: true,
                state: {
                    activeMap: {
                        _id: 'mapId',
                        _userid: userId,
                        stage: {
                            grid: {
                                size: 50,
                            },
                            bounds: {
                                se: {
                                    q: 9,
                                    r: 9,
                                },
                            },
                        },
                    },
                },
            },
            collections: {
                namespaced: true,
                actions: {
                    update: updateSpy,
                },
            },
            hasPermission: {
                namespaced: true,
                getters: {
                    hasPermissionFor: () => () => hasPermissionReturnValue,
                },
            },
        },
    });
    let propsData = {
        stageMouseEvents: new EventTarget(),
    };
    wrapper = shallowMount(FogLayer, { localVue, store, propsData });
    pointerSpy = jest
        .spyOn(FogLayer.methods, 'getRelativePointerPosition')
        .mockReturnValueOnce({ x: 5, y: 5 })
        .mockReturnValueOnce({ x: 10, y: 10 })
        .mockReturnValueOnce({ x: 15, y: 15 })
        .mockReturnValue({ x: 20, y: 20 });
    shapeSetterSpy = jest.spyOn(FogLayer.computed.fogOfWar, 'set');
    wrapper.vm.$refs.fog.getNode = () => null;
}

describe('FogLayer', () => {
    beforeEach(buildWrapper);
    describe('Existence.', () => {
        it('Should exist as itself.', () => {
            expect(wrapper.findComponent(FogLayer).exists()).toBe(true);
        });
    });
    describe('User Interaction.', () => {
        afterAll(() => pointerSpy.mockRestore());

        describe('User activates or deactivates fog editing.', () => {
            let stagedEventsSpy;
            let removedEventsSpy;
            beforeEach(() => {
                stagedEventsSpy = jest.spyOn(EventTarget.prototype, 'addEventListener');
                removedEventsSpy = jest.spyOn(EventTarget.prototype, 'removeEventListener');
            });
            afterAll(() => {
                stagedEventsSpy.mockRestore();
                removedEventsSpy.mockRestore();
            });
            it('Should set event listeners when editing is enabled.', async () => {
                await wrapper.vm.$store.commit('fog/setActive', true);
                expect(stagedEventsSpy).toHaveBeenNthCalledWith(1, 'mousedown', wrapper.vm.onMouseDown);
                expect(stagedEventsSpy).toHaveBeenNthCalledWith(2, 'mouseup', wrapper.vm.onMouseUp);
            });
            it('Should remove event listeners when editing is enabled.', async () => {
                await wrapper.vm.$store.commit('fog/setActive', true);
                await wrapper.vm.$store.commit('fog/setActive', false);
                expect(removedEventsSpy).toHaveBeenNthCalledWith(1, 'mousedown', wrapper.vm.onMouseDown);
                expect(removedEventsSpy).toHaveBeenNthCalledWith(2, 'mouseup', wrapper.vm.onMouseUp);
            });
        });
        describe('isEditing', () => {
            beforeEach(() => wrapper.vm.$store.commit('fog/setActive', true));
            describe('User clicks and drags to obscure/reveal.', () => {
                afterEach(() => pointerSpy.mockReset());
                it('Should not render a shape before mousedown.', () => {
                    expect(wrapper.find('#user-visualization').exists()).toBe(false);
                });
                it('Should render a shape after mousedown.', async () => {
                    await wrapper.vm.onMouseDown();
                    await localVue.nextTick();
                    expect(wrapper.find('#user-visualization').exists()).toBe(true);
                });
                it('Should configure a shape based off of the initial point.', async () => {
                    await wrapper.vm.onMouseDown();
                    expect(wrapper.vm.userVisualization).toStrictEqual({
                        konvaComponent: 'v-rect',
                        config: {
                            fill: expect.stringMatching(hexColorRegex),
                            stroke: expect.stringMatching(hexColorRegex),
                            strokeWidth: expect.any(Number),
                            height: 0,
                            width: 0,
                            x: 5,
                            y: 5,
                            listening: false,
                        },
                    });
                    expect(wrapper.find('#user-visualization').attributes().config).toBe('[object Object]');
                });
                it('Should start listening to mousemove.', () => {
                    const mouseMoveSpy = jest.spyOn(EventTarget.prototype, 'addEventListener');
                    wrapper.vm.onMouseDown();
                    expect(mouseMoveSpy).toHaveBeenNthCalledWith(1, 'mousemove', wrapper.vm.onMouseMove);
                    mouseMoveSpy.mockRestore();
                });
                it('Should update the configured rectangle as the mouse moves.', () => {
                    wrapper.vm.onMouseDown();
                    wrapper.vm.onMouseMove();
                    expect(wrapper.vm.userVisualization).toStrictEqual({
                        konvaComponent: 'v-rect',
                        config: {
                            fill: expect.stringMatching(hexColorRegex),
                            stroke: expect.stringMatching(hexColorRegex),
                            strokeWidth: expect.any(Number),
                            height: 5,
                            width: 5,
                            x: 5,
                            y: 5,
                            listening: false,
                        },
                    });
                    wrapper.vm.onMouseMove();
                    expect(wrapper.vm.userVisualization).toStrictEqual({
                        konvaComponent: 'v-rect',
                        config: {
                            fill: expect.stringMatching(hexColorRegex),
                            stroke: expect.stringMatching(hexColorRegex),
                            strokeWidth: expect.any(Number),
                            height: 10,
                            width: 10,
                            x: 5,
                            y: 5,
                            listening: false,
                        },
                    });
                });
                it('Should exist as expected in canvas.', async () => {
                    localVue.set(wrapper.vm.activeMap.stage, 'fog', {
                        shapes: [{ konvaComponent: 'v-rect', config: {} }],
                    });
                    await localVue.nextTick();
                    expect(wrapper.find('v-rect-stub:not(#user-visualization)').exists()).toBe(true);
                });
                it('Should update the server on completion.', async () => {
                    await wrapper.vm.onMouseUp();
                    expect(updateSpy).toHaveBeenCalledWith(expect.anything(), {
                        collection: 'maps',
                        id: 'mapId',
                        patch: expect.any(Array),
                    });
                });
                it('Should update the configured rectangle on mouseup. (Obscure)', async () => {
                    await wrapper.vm.onMouseUp();
                    expect(shapeSetterSpy).toHaveBeenCalledWith({
                        konvaComponent: 'v-rect',
                        config: {
                            globalCompositeOperation: 'source-over',
                            fill: expect.stringMatching(hexColorRegex),
                            height: 5,
                            width: 5,
                            x: 0,
                            y: 0,
                            listening: false,
                        },
                    });
                });
                it('Should update the configured rectangle on mouseup. (Reveal)', async () => {
                    await wrapper.vm.$store.commit('fog/setObscure', false);
                    await wrapper.vm.onMouseUp();
                    expect(shapeSetterSpy).toHaveBeenCalledWith({
                        konvaComponent: 'v-rect',
                        config: {
                            globalCompositeOperation: 'destination-out',
                            fill: expect.stringMatching(hexColorRegex),
                            height: 5,
                            width: 5,
                            x: 0,
                            y: 0,
                            listening: false,
                        },
                    });
                });
                it('Should stop listening to mousemove.', () => {
                    const mouseMoveSpy = jest.spyOn(EventTarget.prototype, 'removeEventListener');
                    wrapper.vm.onMouseDown();
                    wrapper.vm.onMouseUp();
                    expect(mouseMoveSpy).toHaveBeenNthCalledWith(1, 'mousemove', wrapper.vm.onMouseMove);
                    mouseMoveSpy.mockRestore();
                });
            });
        });
        describe('Has Fog Permission', () => {
            it('Should not be opaque for user.', async () => {
                expect(wrapper.vm.ownerConfig({})).toStrictEqual({ globalCompositeOperation: 'xor', opacity: 0.5 });
            });
        });
    });
});
