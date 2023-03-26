import { mount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import VueMaterial from 'vue-material';
import axios from 'axios';

import CampaignEditForm from '@/campaigns/components/CampaignEditForm.vue';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(VueMaterial);

describe('CampaignEditForm', () => {
    let wrapper;
    let store;
    let actionsAnalytics;
    let actionsErrors;
    let campaignActions;
    let propsData;

    const defaultCampaign = {
        id: 'hashHashHASH',
        name: 'Test Campaign',
        description: 'Test campaign description.',
        imageUrl: 'ImageSource',
    };

    const newCampaign = {
        id: null,
        name: '',
        description: '',
        imageUrl: '',
    };

    function buildWrapper(campaignDetails = defaultCampaign) {
        actionsAnalytics = {
            pushEvent: jest.fn(),
        };
        actionsErrors = {
            modal: jest.fn(error => error),
        };
        campaignActions = {
            createCampaign: jest.fn(),
            updateCampaign: jest.fn(),
            saveCampaign: jest.spyOn(CampaignEditForm.methods, 'saveCampaign'),
            saveEditedCampaign: jest.spyOn(CampaignEditForm.methods, 'saveEditedCampaign'),
        };
        store = new Vuex.Store({
            modules: {
                analytics: {
                    namespaced: true,
                    actions: actionsAnalytics,
                },
                errors: {
                    namespaced: true,
                    actions: actionsErrors,
                },
                campaigns: {
                    namespaced: true,
                    actions: campaignActions,
                },
            },
        });
        propsData = {
            campaign: {
                ...campaignDetails,
            },
        };
        let stubs = { BaseModal: true };
        wrapper = mount(CampaignEditForm, { propsData, store, localVue, stubs });
    }

    let readDataURLSpy;
    let onLoadEndSpy;
    let fileMockData;
    let formDataAppendSpy;

    async function triggerPreviewFile() {
        readDataURLSpy = jest.spyOn(FileReader.prototype, 'readAsDataURL');
        onLoadEndSpy = jest.spyOn(FileReader.prototype, 'onloadend', 'set').mockImplementation(() => 'Success!');
        fileMockData = new File(['mock'], 'mockImageName.jpg', { type: 'image/jpeg' });
        const eventMock = { target: { files: [fileMockData] } };
        await wrapper.vm.previewFile(eventMock);
    }

    describe('Renders as expected.', () => {
        buildWrapper();
        it('The component exists.', () => {
            expect(wrapper.exists()).toBeTruthy();
        });
        it('The component renders as itself.', () => {
            expect(wrapper.is(CampaignEditForm)).toBeTruthy();
        });
    });
    describe('Methods', () => {
        describe('saveCampaign', () => {
            beforeEach(() => {
                buildWrapper(newCampaign);
            });
            afterEach(() => {
                for (const prop in campaignActions) {
                    campaignActions[prop].mockRestore();
                }
            });
            it('Sends expected information in post request.', async () => {
                await wrapper.vm.saveCampaign();
                expect(campaignActions.createCampaign).toHaveBeenCalledTimes(1);
                expect(campaignActions.createCampaign).toHaveBeenCalledWith(expect.anything(), wrapper.vm.campaignData);
            });
            it('Emitted as expected.', async () => {
                await wrapper.vm.saveCampaign();
                expect(wrapper.emitted().finished).toStrictEqual([[{ saved: true }]]);
            });
            it('Triggers from user interaction.', () => {
                wrapper.find('.modal-button.selected').trigger('click');
                expect(campaignActions.saveCampaign).toHaveBeenCalledTimes(1);
            });
        });
        describe('saveEditedCampaign', () => {
            beforeEach(() => {
                buildWrapper();
            });
            afterEach(() => {
                for (const prop in campaignActions) {
                    campaignActions[prop].mockRestore();
                }
            });

            it('Expect axios to be called with campaignData.', () => {
                wrapper.vm.saveEditedCampaign();
                expect(campaignActions.updateCampaign).toHaveBeenCalledTimes(1);
                expect(campaignActions.updateCampaign).toHaveBeenCalledWith(expect.anything(), wrapper.vm.campaignData);
            });
            it('Emits as expected.', async () => {
                let spy = jest.spyOn(axios, 'put').mockImplementation(() => 'Success!');
                await wrapper.vm.saveEditedCampaign();
                expect(wrapper.emitted().finished).toEqual([[{ saved: true }]]);
                spy.mockRestore();
            });
            it('Triggered by user interaction.', () => {
                wrapper.find('button.modal-button.selected').trigger('click');
                expect(campaignActions.saveEditedCampaign).toHaveBeenCalledTimes(1);
            });
        });
        describe('previewFile', () => {
            beforeEach(() => {
                buildWrapper();
                triggerPreviewFile();
            });
            afterEach(() => {
                readDataURLSpy.mockRestore();
                onLoadEndSpy.mockRestore();
            });

            it('Added the load event listener.', () => {
                expect(onLoadEndSpy).toHaveBeenCalledTimes(1);
            });
            it('Calls FileReader prototype readAsData with proper arguments', () => {
                expect(readDataURLSpy).toHaveBeenCalledWith(fileMockData);
            });
            it('Resets the uploader after use.', () => {
                expect(wrapper.vm.$refs.uploader.value).toBe('');
            });
            it('Expect onloadend to be called with function.', () => {
                expect(onLoadEndSpy).toHaveBeenCalledWith(wrapper.vm.submitImage);
            });
        });
        describe('submitImage', () => {
            let data;
            let spyAxios;
            describe('Axios success!', () => {
                beforeEach(() => {
                    data = { files: [{ url: 'IAmURL' }] };
                    spyAxios = jest.spyOn(axios, 'post').mockImplementation(() => {
                        return { data };
                    });
                    formDataAppendSpy = jest.spyOn(FormData.prototype, 'append');
                    buildWrapper();
                    wrapper.setData({ file: fileMockData, isLoading: true });
                });
                afterEach(() => {
                    spyAxios.mockRestore();
                    formDataAppendSpy.mockRestore();
                });

                it('Should append to the new formData with the correct arguments.', () => {
                    wrapper.vm.submitImage();
                    expect(formDataAppendSpy).toHaveBeenCalledWith('files', fileMockData);
                });
                it('Should send a post request with a specific the loaded file.', () => {
                    wrapper.vm.submitImage();
                    expect(spyAxios).toHaveBeenCalledWith('/api/files?path=campaign', expect.any(FormData), {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });
                });
                it('Should set campaignData URL.', async () => {
                    wrapper.vm.submitImage();
                    await localVue.nextTick();
                    expect(wrapper.vm.campaignData.imageUrl).toBe(data.files[0].url);
                });
                it('Should dispatch to analytics.', async () => {
                    wrapper.vm.submitImage();
                    await localVue.nextTick();
                    expect(actionsAnalytics.pushEvent).toHaveBeenCalledWith(expect.anything(), {
                        event: { category: 'Campaign', action: 'AddImage', name: 'IAmURL', value: defaultCampaign.id },
                    });
                });
                it('Should return isLoading to false state.', async () => {
                    wrapper.vm.submitImage();
                    await localVue.nextTick();
                    expect(wrapper.vm.isLoading).toBe(false);
                });
            });
            describe('Axios failure....', () => {
                const response = { status: 413, message: 'Intentional test error.' };
                beforeEach(() => {
                    spyAxios = jest.spyOn(axios, 'post').mockImplementation(() => {
                        throw { response };
                    });
                    buildWrapper();
                    wrapper.setData({ file: fileMockData, isLoading: true });
                });
                afterEach(() => spyAxios.mockRestore());
                it('Should reset imageUrl and file.', async () => {
                    wrapper.vm.submitImage();
                    await localVue.nextTick();
                    expect(wrapper.vm.campaignData.imageUrl).toBe('');
                    expect(wrapper.vm.file).toBe('');
                });
                it('Should call showError with a special response to status 413.', () => {
                    wrapper.vm.submitImage();
                    expect(actionsErrors.modal).toHaveBeenCalledWith(
                        expect.anything(),
                        new Error('File size is too large (should be 32MB or smaller)'),
                    );
                });
                it('Should call showError with a specific response.', () => {
                    response.status = 414;
                    wrapper.vm.submitImage();
                    expect(actionsErrors.modal).toHaveBeenCalledWith(expect.anything(), { response });
                });
                it('Should return isLoading to false state.', async () => {
                    wrapper.vm.submitImage();
                    await localVue.nextTick();
                    expect(wrapper.vm.isLoading).toBe(false);
                });
            });
        });
        describe('updateBannerImage', () => {
            it('Updates source of the image.', () => {
                buildWrapper();
                expect(wrapper.get('label.dropbox').element.style.backgroundImage).toBe(
                    `url(${propsData.campaign.imageUrl})`,
                );
            });
        });
        describe('exitEditor', () => {
            buildWrapper();
            it('Emits as expected.', () => {
                wrapper.vm.exitEditor();
                expect(wrapper.emitted().finished).toEqual([[{ saved: false }]]);
            });
            it('Emits the expected result from user interaction.', () => {
                let spy = jest.spyOn(CampaignEditForm.methods, 'exitEditor');
                buildWrapper();
                wrapper.find('.modal-button:not(.selected)').trigger('click');
                expect(spy).toHaveBeenCalledTimes(1);
                spy.mockRestore();
            });
        });
    });
    describe('Conditional Rendering of preview image (file).', () => {
        describe('Before image is "uploaded".', () => {
            buildWrapper();

            it('.dropbox is rendered.', () => {
                expect(wrapper.find('.dropbox').isVisible()).toBeTruthy();
            });
            it('The .loading-bar is not shown.', () => {
                expect(wrapper.find('.loading-bar').exists()).toBeFalsy();
            });
            it('.dropbox-hidden is active with URL path.', () => {
                expect(wrapper.find('.dropbox').classes()).toContain('dropbox-hidden');
            });
            it('.dropbox-target is not active without URL path.', () => {
                buildWrapper(newCampaign);
                expect(wrapper.find('.dropbox').classes()).not.toContain('dropbox-hidden');
            });
        });
        describe('After image is "uploaded".', () => {
            it('The .loading-bar is shown.', async () => {
                buildWrapper();
                wrapper.setData({ file: fileMockData, isLoading: true });
                await localVue.nextTick();
                expect(wrapper.find('.loading-bar').isVisible()).toBeTruthy();
            });
        });
    });
});
