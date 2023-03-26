import Vuex from 'vuex';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import VueKonva from 'vue-konva';

import PlayToken from '@/characters/components/PlayToken.vue';
import SquareGrid from '@/core/grid/SquareGrid.js';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(VueKonva);

describe('PlayToken', () => {
    let wrapper;
    let actions;
    let store;

    function buildWrapper(additionalProps, gridSize = 50) {
        return shallowMount(PlayToken, {
            propsData: {
                entity: { pos: { q: 5, r: 5 }, ...additionalProps },
                gridSpace: new SquareGrid(gridSize),
                selectedProp: false,
                defaultPixelsPerGrid: 50,
            },
            localVue,
            store,
        });
    }

    beforeEach(() => {
        actions = {
            load: jest.fn().mockReturnValue({ width: 50, height: 50 }),
        };
        store = new Vuex.Store({
            modules: {
                assets: {
                    namespaced: true,
                    actions,
                },
                tokens: {
                    namespaced: true,
                    state: {
                        selectedToken: {},
                    },
                    mutations: {
                        updateSelectedToken: jest.fn(),
                    },
                },
            },
        });
    });

    describe('basic', () => {
        beforeEach(() => {
            wrapper = buildWrapper({ image: {} });
        });

        it('should render image', () => {
            expect(wrapper.find('#image').exists()).toBeTruthy();
        });

        it('should be selected', async () => {
            wrapper.setData({ selected: true });
            await localVue.nextTick();
            expect(wrapper.find('#selectedSquare').exists()).toBeTruthy();
        });
    });

    describe('circles', () => {
        beforeEach(() => {
            wrapper = buildWrapper({ borderMode: 'circle', image: {} });
        });

        it('should be selected with a circle', async () => {
            wrapper.setData({ selected: true });
            await localVue.nextTick();
            expect(wrapper.find('#selectedCircle').exists()).toBeTruthy();
        });
    });

    describe('squares', () => {
        beforeEach(() => {
            wrapper = buildWrapper({ borderMode: 'square', image: {} });
        });

        it('should be selected with a circle', async () => {
            wrapper.setData({ selected: true });
            await localVue.nextTick();
            expect(wrapper.find('#selectedSquare').exists()).toBeTruthy();
        });
    });

    describe('coin', () => {
        beforeEach(() => {
            wrapper = buildWrapper({ borderMode: 'coin' });
        });

        it('should have container circles', () => {
            expect(wrapper.find('#outerContainerCircle').exists()).toBeTruthy();
        });
    });

    describe('tile', () => {
        beforeEach(() => {
            wrapper = buildWrapper({ borderMode: 'tile' });
        });

        it('should have container squares', () => {
            expect(wrapper.find('#outerContainerSquare').exists()).toBeTruthy();
        });
    });

    describe('size', () => {
        const gridSize = 50;

        beforeEach(() => {
            wrapper = buildWrapper({ borderMode: 'coin', tokenSize: 1 }, gridSize);
        });

        describe('tiny', () => {
            beforeEach(() => {
                wrapper.setProps({ entity: { pos: { q: 5, r: 5 }, borderMode: 'coin', tokenSize: 1 } });
            });

            it('should be smaller than grid', () => {
                expect(wrapper.vm.outerContainerConfig.width).toBeLessThan(gridSize);
            });
        });

        describe('medium', () => {
            beforeEach(() => {
                wrapper.setProps({ entity: { pos: { q: 5, r: 5 }, borderMode: 'coin', tokenSize: 2 } }, gridSize);
            });

            it('should equal grid size', () => {
                expect(wrapper.vm.outerContainerConfig.width).toEqual(gridSize);
            });
        });

        describe('large', () => {
            beforeEach(() => {
                wrapper.setProps({ entity: { pos: { q: 5, r: 5 }, borderMode: 'coin', tokenSize: 3 } }, gridSize);
            });

            it('should be double grid size', () => {
                expect(wrapper.vm.outerContainerConfig.width).toEqual(gridSize * 2);
            });
        });

        describe('huge', () => {
            beforeEach(() => {
                wrapper.setProps({ entity: { pos: { q: 5, r: 5 }, borderMode: 'coin', tokenSize: 4 } }, gridSize);
            });

            it('should be triple grid size', () => {
                expect(wrapper.vm.outerContainerConfig.width).toEqual(gridSize * 3);
            });
        });
    });

    describe('icon', () => {
        const gridSize = 50;

        beforeEach(() => {
            wrapper = buildWrapper({ icon: 'testing' }, gridSize);
        });

        it('should be a sixth of the grid size', () => {
            expect(wrapper.vm.iconCircleSize).toEqual(gridSize / 6);
        });
    });

    describe('computed', () => {
        beforeEach(() => buildWrapper({ borderMode: 'FAKE' }));
        describe('outerContainerConfig', () => {
            it('should return an empty object when given an unhandled borderMode', () => {
                expect(wrapper.vm.outerContainerConfig).toStrictEqual({});
            });
        });
        describe('middleContainerConfig', () => {
            it('should return an empty object when given an unhandled borderMode', () => {
                expect(wrapper.vm.middleContainerConfig).toStrictEqual({});
            });
        });
        describe('innerContainerConfig', () => {
            it('should return an empty object when given an unhandled borderMode', () => {
                expect(wrapper.vm.innerContainerConfig).toStrictEqual({});
            });
        });
        describe('innerBGConfig', () => {
            it('should return an empty object when given an unhandled borderMode', () => {
                expect(wrapper.vm.innerBGConfig).toStrictEqual({});
            });
        });
        describe('isCenteredOnIntersection', () => {
            it('should be true for large tokens', async () => {
                wrapper = buildWrapper({ tokenSize: 3 });
                expect(wrapper.vm.isCenteredOnIntersection).toBeTruthy();
            });
            it('should be false for not large tokens', async () => {
                wrapper = buildWrapper({ tokenSize: 1 });
                expect(wrapper.vm.isCenteredOnIntersection).toBeFalsy();
                wrapper = buildWrapper({ tokenSize: 2 });
                expect(wrapper.vm.isCenteredOnIntersection).toBeFalsy();
            });
            it('should handle strings as number equivalents', async () => {
                wrapper = buildWrapper({ tokenSize: '1' });
                expect(wrapper.vm.isCenteredOnIntersection).toBeFalsy();
                wrapper = buildWrapper({ tokenSize: '2' });
                expect(wrapper.vm.isCenteredOnIntersection).toBeFalsy();
            });
        });
    });

    describe('methods', () => {
        beforeEach(() => {
            wrapper = buildWrapper({ icon: 'testing' });
        });

        describe('getTokenPosition', () => {
            it('should shift the position of large tokens', async () => {
                wrapper.vm.$refs.group.getNode = jest.fn(() => ({ position: () => ({ x: 25, y: 25 }) }));
                wrapper.setProps({ entity: { pos: { q: 5, r: 5 }, borderMode: 'coin', tokenSize: 3 } });
                await localVue.nextTick();
                expect(wrapper.vm.getTokenPosition()).toStrictEqual({ x: 0, y: 0 });
            });

            it('should not shift the position of not large tokens', async () => {
                wrapper.vm.$refs.group.getNode = jest.fn(() => ({ position: () => ({ x: 25, y: 25 }) }));
                wrapper.setProps({ entity: { pos: { q: 5, r: 5 }, borderMode: 'coin', tokenSize: 4 } });
                await localVue.nextTick();
                expect(wrapper.vm.getTokenPosition()).toStrictEqual({ x: 25, y: 25 });
            });
        });

        describe('onDragend', () => {
            it('should emit moved', () => {
                wrapper.vm.onDragend();
                expect(wrapper.emitted().moved).toBeTruthy();
            });
        });

        describe('onClick', () => {
            it('should emit selected', () => {
                wrapper.vm.onClick();
                expect(wrapper.emitted().selected).toBeTruthy();
            });

            it('should emit deselected', () => {
                wrapper.vm.onClick();
                wrapper.vm.onClick();
                expect(wrapper.emitted().deselected).toBeTruthy();
            });
        });

        describe('onDoubleClick', () => {
            it('should emit selected and dblclick', () => {
                wrapper.vm.onDoubleClick();
                expect(wrapper.emitted().selected).toBeTruthy();
                expect(wrapper.emitted().dblclick).toBeTruthy();
            });
        });
    });
});
