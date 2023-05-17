import 'jest-canvas-mock';

import { createLocalVue, shallowMount } from '@vue/test-utils';
import VueKonva from 'vue-konva';
import Vuex from 'vuex';
import waitForExpect from 'wait-for-expect';

import MapImage from '@/table/components/scene/MapImage.vue';
import GameStateStore from '@/store/GameStateStore';

const localVue = createLocalVue();
localVue.use(VueKonva);
localVue.use(Vuex);

const store = new Vuex.Store({
    modules: {
        editingModes: {
            namespaced: true,
            state: {
                editMap: false,
            },
        },
        gamestate: GameStateStore,
    },
});

describe('MapImage', () => {
    const mockImageId = 'mock-image-id';
    const mockImageWidth = 520;
    const mockImageHeight = 350;
    const mockImageX = 10;
    const mockImageY = 20;
    const mockImageRotation = 53;
    const mockImageScaleX = 1.1;
    const mockImageScaleY = 1.2;

    describe('imageConfig', () => {
        it('should not throw an error', () => {
            shallowMount(MapImage, {
                localVue,
                store,
            });
        });
    });

    test('mapImages computed property contains an image object for each map file', () => {
        const wrapper = shallowMount(MapImage, {
            localVue,
            store,
            propsData: {
                files: [
                    {
                        id: mockImageId,
                        asset: {
                            src: 'http://localhost/test.png',
                        },
                        pos: {
                            x: mockImageX,
                            y: mockImageY,
                            rotation: mockImageRotation,
                            scaleX: mockImageScaleX,
                            scaleY: mockImageScaleY,
                        },
                    },
                ],
            },
        });

        expect(wrapper.vm.mapImages).toEqual([
            {
                image: expect.any(Image),
                name: mockImageId,

                x: mockImageX,
                y: mockImageY,
                rotation: mockImageRotation,
                scaleX: mockImageScaleX,
                scaleY: mockImageScaleY,
            },
        ]);
    });

    test('mapImages watcher sets mapShapes in global state', async () => {
        const storeCommitSpy = jest.spyOn(store, 'commit');
        // Ensure image load event fires
        jest.spyOn(Image.prototype, 'addEventListener').mockImplementation((event, listener) => {
            if (event === 'load') {
                setTimeout(listener);
            }
        });
        // Mock image dimensions so we can assert they are used by the watcher
        jest.spyOn(Image.prototype, 'width', 'get').mockReturnValue(mockImageWidth);
        jest.spyOn(Image.prototype, 'height', 'get').mockReturnValue(mockImageHeight);

        // Mount the component
        shallowMount(MapImage, {
            localVue,
            store,
            propsData: {
                // Add an image to the map with some mock data
                files: [
                    {
                        id: mockImageId,
                        asset: {
                            src: 'http://localhost/test.png',
                        },
                        pos: {
                            x: mockImageX,
                            y: mockImageY,
                            rotation: mockImageRotation,
                            scaleX: mockImageScaleX,
                            scaleY: mockImageScaleY,
                        },
                    },
                ],
            },
        });

        // Wait for the store to be updated with the correct mapShapes data,
        // based on the mock file passed above in propsData
        const expectedMapShapes = [
            {
                name: mockImageId,
                x: mockImageX,
                y: mockImageY,
                rotation: mockImageRotation,
                scaleX: mockImageScaleX,
                scaleY: mockImageScaleY,
                width: mockImageWidth,
                height: mockImageHeight,
            },
        ];
        await waitForExpect(() => {
            expect(storeCommitSpy).toHaveBeenCalledWith('gamestate/setMapShapes', expectedMapShapes, undefined);
        });

        // Jest usually restores mocks (i.e. puts the original implementation
        // back) between test suites, but when you've overriden a function on
        // the prototype of an object (in this case the built-in Image class).
        // We restore _all_ mocks here just to be safe.
        jest.restoreAllMocks();
    });
});
