import { mount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import _ from 'lodash';

import GmControlsModal from '@/campaigns/components/GmControlsModal.vue';

const localVue = createLocalVue();
localVue.use(Vuex);

let wrapper;
let store;
let gmPermissions;
let players;
let profile;

const gmPermissionsStore = {
    namespaced: true,
    state: {
        displayGmControlsModal: true,
    },
    getters: {
        permissionSettings: () => ({
            deleteToken: true,
            gridControl: false,
            fogControl: true,
            editAnyMap: true,
            moveAll: false,
        }),
    },
    mutations: {
        toggleDisplayGmControlsModal: jest.fn(),
    },
    actions: {
        setGmPermissionSetting: jest.fn(),
    },
};

const hasPermission = {
    namespaced: true,
    getters: {
        isCampaignOwner: () => true,
        isCampaignOwnerById: () => () => true,
        getGameMasterStatus: () => true,
    },
};

const PlayerStore = {
    namespaced: true,
    getters: {
        getPlayers: () => [
            { userId: 'userId1' },
            { userId: 'userId2' },
            { userId: 'userId3' },
            { userId: 'userId4' },
            { userId: 'userId5' },
        ],
        gameMasters: () => ({ userId1: 'userId1', userId2: 'userId2' }),
        nonGameMasters: () => ({ userId3: 'userId3', userId4: 'userId4', userId5: 'userId5' }),
    },
};

const ProfileStore = {
    namespaced: true,
    getters: {
        getProfile: () => id => ({ userId: id, imageUrl: `${id}-image` }),
    },
};

function buildWrapper() {
    gmPermissions = _.cloneDeep(gmPermissionsStore);
    players = _.cloneDeep(PlayerStore);
    profile = _.cloneDeep(ProfileStore);
    store = new Vuex.Store({
        modules: {
            gmPermissions,
            hasPermission,
            players,
            profile,
        },
    });
    let stubs = { BaseModal: true };
    wrapper = mount(GmControlsModal, { store, localVue, stubs });
}

describe('GmControlsModal', () => {
    beforeEach(buildWrapper);
    describe('Exists as expected', () => {
        it('Should exist as itself.', () => {
            expect(wrapper.findComponent(GmControlsModal).exists()).toBe(true);
        });
    });
    describe('Users Displays', () => {
        describe('Game Masters', () => {
            it('Should render two game masters.', () => {
                expect(wrapper.findAll('.gm-display').length).toBe(2);
            });
        });
        describe('Players', () => {
            it('Should render three players.', () => {
                expect(wrapper.findAll('.player-display').length).toBe(3);
            });
        });
    });
    describe('Permissions', () => {
        describe('Grid Control', () => {
            it('Should visually represent gridControl.', () => {
                const toggle = wrapper.find('#gm-grid');
                expect(toggle.element.checked).toBe(gmPermissions.getters.permissionSettings().gridControl);
            });
            it('Should send the correct update arguments.', () => {
                wrapper.find('#gm-grid').trigger('click');
                expect(gmPermissions.actions.setGmPermissionSetting).toHaveBeenCalledWith(
                    expect.anything(),
                    'gridControl',
                );
                jest.clearAllMocks();
            });
        });
        describe('Fog Control', () => {
            it('Should visually represent fogControl.', () => {
                const toggle = wrapper.find('#gm-fog');
                expect(toggle.element.checked).toBe(gmPermissions.getters.permissionSettings().fogControl);
            });
            it('Should send the correct update arguments.', () => {
                wrapper.find('#gm-fog').trigger('click');
                expect(gmPermissions.actions.setGmPermissionSetting).toHaveBeenCalledWith(
                    expect.anything(),
                    'fogControl',
                );
                jest.clearAllMocks();
            });
        });
        describe('Move All', () => {
            it('Should visually represent moveAll.', () => {
                const toggle = wrapper.find('#gm-move-all');
                expect(toggle.element.checked).toBe(gmPermissions.getters.permissionSettings().moveAll);
            });
            it('Should send the correct update arguments.', () => {
                wrapper.find('#gm-move-all').trigger('click');
                expect(gmPermissions.actions.setGmPermissionSetting).toHaveBeenCalledWith(expect.anything(), 'moveAll');
                jest.clearAllMocks();
            });
        });
    });
    describe('Close', () => {
        it('Should call the close function on click.', async () => {
            await wrapper.find('#close').trigger('click');
            expect(gmPermissions.mutations.toggleDisplayGmControlsModal).toHaveBeenCalledTimes(1);
        });
    });
    describe('Methods', () => {
        describe('withoutNullPropertiesFrom', () => {
            it('Should return a list without null properties.', () => {
                const list = [null, null, null, null, 3, null];
                expect(wrapper.vm.withoutNullPropertiesFrom(list)).toStrictEqual([3]);
            });
            it('Should not mutate the original list.', () => {
                const list = [null, null, null, null, 3, null];
                wrapper.vm.withoutNullPropertiesFrom(list);
                expect(list).toStrictEqual([null, null, null, null, 3, null]);
            });
        });
    });
});
