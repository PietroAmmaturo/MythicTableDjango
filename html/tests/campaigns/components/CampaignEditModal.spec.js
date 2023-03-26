import { mount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';

import CampaignEditModal from '@/campaigns/components/CampaignEditModal.vue';
import CampaignEditForm from '@/campaigns/components/CampaignEditForm.vue';

const localVue = createLocalVue();
localVue.use(Vuex);

describe('CampaignEditForm', () => {
    let wrapper;
    let store;
    let state;
    let mutations;
    let actions;

    function buildWrapper(display = true) {
        state = {
            activeCampaign: {
                id: 'hashHashHASH',
                name: 'Test Campaign',
                description: 'Test campaign description.',
                imageUrl: 'ImageSource',
            },
            displayEditModal: display,
        };
        mutations = {
            toggleDisplayEditModal: jest.fn(),
        };
        actions = {
            getActiveCampaign: jest.fn(),
        };
        store = new Vuex.Store({
            modules: {
                campaigns: {
                    namespaced: true,
                    state,
                    mutations,
                    actions,
                },
            },
        });
        let stubs = { BaseModal: true };
        wrapper = mount(CampaignEditModal, { store, localVue, stubs });
    }

    describe('It renders as expected.', () => {
        buildWrapper();
        it('The component exists.', () => {
            expect(wrapper.exists()).toBeTruthy();
        });
        it('The component renders as itself.', () => {
            expect(wrapper.is(CampaignEditModal)).toBeTruthy();
        });
        it('Does render contents if display is true.', () => {
            buildWrapper();
            expect(wrapper.findComponent(CampaignEditForm).exists()).toBeTruthy();
        });
        it('Does not render contents if display is false.', () => {
            buildWrapper(false);
            expect(wrapper.findComponent(CampaignEditForm).exists()).toBeFalsy();
        });
    });
    describe('Methods: ', () => {
        describe('close', () => {
            beforeEach(() => buildWrapper());
            afterEach(() => jest.clearAllMocks());
            it('Calls expected functions when saved.', () => {
                wrapper.vm.close({ saved: true });
                expect(actions.getActiveCampaign).toHaveBeenCalledTimes(1);
                expect(mutations.toggleDisplayEditModal).toHaveBeenCalledTimes(1);
            });
            it('Calls expected functions when canceled.', () => {
                wrapper.vm.close({ saved: false });
                expect(actions.getActiveCampaign).toHaveBeenCalledTimes(0);
                expect(mutations.toggleDisplayEditModal).toHaveBeenCalledTimes(1);
            });
        });
    });
});
