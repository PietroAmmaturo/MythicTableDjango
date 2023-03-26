import Vuex from 'vuex';
import { createLocalVue } from '@vue/test-utils';
import _ from 'lodash';
import axios from 'axios';

import LibraryStore from '@/core/library/store/LibraryStore';

jest.mock('axios');

const localVue = createLocalVue();
localVue.use(Vuex);

describe('LibraryStore', () => {
    let store;
    beforeEach(() => {
        store = new Vuex.Store({
            modules: {
                library: _.cloneDeep(LibraryStore),
            },
        });
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('actions', () => {
        describe('addCharacter', () => {
            it('only tries to upload valid files', () => {
                return expect(store.dispatch('library/addCharacter', null)).rejects.toMatchObject({
                    message: 'No files provided',
                });
            });

            it('posts valid files', async () => {
                const fakeRequestData = { target: { files: [{}] } };
                axios.post.mockResolvedValue();
                await store.dispatch('library/addCharacter', fakeRequestData);
                expect(axios.post).toHaveBeenCalledTimes(1);
            });
        });

        describe('getCharacters', () => {
            it('correctly maps response data', async () => {
                const fakeResponseData = {
                    data: [
                        {
                            id: 'id1',
                            url: 'url1',
                        },
                        {
                            id: 'id2',
                            url: 'url2',
                        },
                        {
                            id: 'id3',
                            url: 'url3',
                        },
                    ],
                };
                axios.get.mockResolvedValue(fakeResponseData);

                await store.dispatch('library/getCharacters');

                expect(store.state.library.characters).toEqual(
                    expect.arrayContaining([
                        {
                            id: 'id1',
                            asset: {
                                kind: 'image',
                                src: 'url1',
                            },
                        },
                        {
                            id: 'id2',
                            asset: {
                                kind: 'image',
                                src: 'url2',
                            },
                        },
                        {
                            id: 'id3',
                            asset: {
                                kind: 'image',
                                src: 'url3',
                            },
                        },
                    ]),
                );
            });
        });
    });
});
