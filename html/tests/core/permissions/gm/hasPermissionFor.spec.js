import { createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import _ from 'lodash';

import permissionsVerification from '@/core/permissions/gm/hasPermissionFor.js';
import { defaultPermissions } from '@/core/permissions/gm/store.js';

describe('permissionsVerification', () => {
    let localVue;
    let store;
    let hasPermissionFor;
    const gmPermissionsTrue = allPermissionsTo(true);
    const gmPermissionsFalse = allPermissionsTo(false);

    function allPermissionsTo(boolean) {
        const allPermissions = _.cloneDeep(defaultPermissions);
        _.forEach(allPermissions, (value, key, collection) => (collection[key] = boolean));
        return allPermissions;
    }

    function buildStore(settings, isGameMaster, mapCreator = 'userId') {
        localVue = createLocalVue();
        localVue.use(Vuex);

        store = new Vuex.Store({
            modules: {
                hasPermission: _.cloneDeep(permissionsVerification),
                gmPermissions: {
                    namespaced: true,
                    getters: {
                        permissionSettings: () => settings,
                    },
                },
                players: {
                    namespaced: true,
                    getters: {
                        isGameMaster: () => () => isGameMaster,
                    },
                },
                profile: {
                    namespaced: true,
                    state: {
                        me: {
                            id: 'thisUsersId',
                        },
                    },
                },
                gamestate: {
                    namespaced: true,
                    state: {
                        activeMap: {
                            _userid: mapCreator,
                        },
                    },
                },
            },
        });

        hasPermissionFor = store.getters['hasPermission/hasPermissionFor'];
    }

    describe('hasPermissionFor', () => {
        describe('gmPermissionActiveFor', () => {
            describe('Is game master.', () => {
                beforeEach(() => buildStore(gmPermissionsTrue, true));
                it('Should return true for gridControl.', () => {
                    expect(hasPermissionFor('gridControl')).toBe(true);
                });
                it('Should return true for fogControl.', () => {
                    expect(hasPermissionFor('fogControl')).toBe(true);
                });
                it('Should return true for editAnyMap.', () => {
                    expect(hasPermissionFor('editAnyMap')).toBe(true);
                });
                it('Should return true for moveAll.', () => {
                    expect(hasPermissionFor('moveAll')).toBe(true);
                });
            });
            describe('Is not game master.', () => {
                beforeEach(() => buildStore(gmPermissionsTrue, false));
                it('Should return false for gridControl.', () => {
                    expect(hasPermissionFor('gridControl')).toBe(false);
                });
                it('Should return false for fogControl.', () => {
                    expect(hasPermissionFor('fogControl')).toBe(false);
                });
                it('Should return false for editAnyMap.', () => {
                    expect(hasPermissionFor('editAnyMap')).toBe(false);
                });
                it('Should return false for moveAll.', () => {
                    expect(hasPermissionFor('moveAll')).toBe(false);
                });
            });
            describe('Exceptions', () => {
                describe('editAnyMap', () => {
                    it('Should always allow the map owner to edit.', () => {
                        buildStore(gmPermissionsTrue, false, 'thisUsersId');
                        expect(hasPermissionFor('editAnyMap', 'thisUsersId')).toBe(true);
                    });
                });
            });
        });
        describe('assumePermissionFor', () => {
            describe('Expected true result.', () => {
                beforeEach(() => {
                    buildStore(gmPermissionsFalse, false, 'thisUsersId');
                });
                it('Should return true for gridControl, as active map owner.', () => {
                    expect(hasPermissionFor('gridControl')).toBe(true);
                });
                it('Should return true for fogControl.', () => {
                    expect(hasPermissionFor('fogControl')).toBe(true);
                });
                it('Should return true for editAnyMap.', () => {
                    expect(hasPermissionFor('editAnyMap', 'thisUsersId')).toBe(true);
                });
                it('Should return true for moveAll.', () => {
                    expect(hasPermissionFor('moveAll', 'thisUsersId')).toBe(true);
                });
            });
            describe('Expected false result.', () => {
                beforeEach(() => {
                    buildStore(gmPermissionsFalse, false, 'otherUsersId');
                });
                it('Should return false for gridControl, as active map owner.', () => {
                    expect(hasPermissionFor('gridControl')).toBe(false);
                });
                it('Should return false for fogControl.', () => {
                    expect(hasPermissionFor('fogControl')).toBe(false);
                });
                it('Should return false for editAnyMap.', () => {
                    expect(hasPermissionFor('editAnyMap', 'otherUsersId')).toBe(false);
                });
                it('Should return false for moveAll.', () => {
                    expect(hasPermissionFor('moveAll', 'otherUsersId')).toBe(false);
                });
            });
        });
    });
});
