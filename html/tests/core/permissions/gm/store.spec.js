import _ from 'lodash';

import gmPermissionsStore from '@/core/permissions/gm/store.js';
import { COLLECTION_TYPES } from '@/core/collections/constants';

describe('gmPermissionsStore', () => {
    const unusedArgument = {};
    const settings = {
        deleteToken: true,
        gridControl: false,
        fogControl: true,
        editAnyMap: false,
        hiddenTokens: false,
        moveAll: true,
    };
    const rootGetters = {
        ['collections/getCollection']: jest.fn(),
        ['players/getPlayers']: {
            userId1: { userId: 'userId1', isGameMaster: true },
            userId2: { userId: 'userId2', isGameMaster: true },
            userId3: { userId: 'userId3', isGameMaster: false },
            userId4: { userId: 'userId4', isGameMaster: false },
            userId5: { userId: 'userId5', isGameMaster: false },
        },
    };

    afterEach(jest.clearAllMocks);

    describe('Getters', () => {
        const { getters } = gmPermissionsStore;
        const permissionsFound = {
            permissionsId: { settings, _id: 'permissionsId' },
        };
        const noPermissionsFound = [];

        describe('permissions', () => {
            it('Should call on the collections store to get GM permissions data.', () => {
                getters.permissions(unusedArgument, unusedArgument, unusedArgument, rootGetters);
                expect(rootGetters['collections/getCollection']).toHaveBeenCalledWith(COLLECTION_TYPES.permissions);
            });
        });
        describe('permissionsKey', () => {
            it('Should return the first key it finds.', () => {
                const permissionsKey = getters.permissionsKey(unusedArgument, { permissions: { permissionsId: {} } });
                expect(permissionsKey).toBe('permissionsId');
            });
        });
        describe('permissionSettings', () => {
            it('Should return the setting for gm permissions.', () => {
                const permissionSettings = getters.permissionSettings(unusedArgument, {
                    permissions: permissionsFound,
                    permissionsKey: 'permissionsId',
                });
                expect(permissionSettings).toStrictEqual(settings);
            });
            it('Should assume value for all settings if gm permissions do not exist.', () => {
                const permissionSettings = getters.permissionSettings(unusedArgument, {
                    permissions: noPermissionsFound,
                });
                expect(permissionSettings).toStrictEqual({
                    deleteToken: true,
                    editAnyMap: true,
                    gridControl: false,
                    fogControl: false,
                    hiddenTokens: false,
                    moveAll: false,
                });
            });
        });
    });

    describe('Mutations', () => {
        const { state, mutations } = gmPermissionsStore;
        describe('toggleDisplayGmControlsModal', () => {
            it('Should toggle the state when called.', () => {
                mutations.toggleDisplayGmControlsModal(state);
                expect(state.displayGmControlsModal).toBe(true);
            });
        });
    });

    describe('actions', () => {
        const { actions } = gmPermissionsStore;
        const permissionSettings = _.cloneDeep(settings);
        let currentCollection;
        let editableCollection;
        let dispatch;
        let getters;
        const defaultCollection = {
            permissions: {
                permissionsId: {
                    _id: 'permissionsId',
                    settings,
                },
            },
        };

        beforeEach(() => {
            dispatch = jest.fn();
            currentCollection = _.cloneDeep(defaultCollection.permissions['permissionsId']);
            editableCollection = _.cloneDeep(defaultCollection.permissions['permissionsId']);
            getters = {
                permissions: _.cloneDeep(defaultCollection.permissions),
                permissionSettings,
                permissionsKey: 'permissionsId',
            };
        });

        describe('setGmPermissionSetting', () => {
            it('Should dispatch to update permissions, when it exists.', () => {
                getters = { permissions: ['permission'] };
                actions.setGmPermissionSetting({ dispatch, getters }, 'fogControl');
                expect(dispatch).toHaveBeenCalledWith('permissionsExist', 'fogControl');
            });
            it('Should dispatch to add permission, when it does not exist.', () => {
                getters = { permissions: [] };
                actions.setGmPermissionSetting({ dispatch, getters }, 'fogControl');
                expect(dispatch).toHaveBeenCalledWith('permissionsDoNotExist', 'fogControl');
            });
        });
        describe('permissionsExist', () => {
            it('Should update the database if something changes.', async () => {
                dispatch = jest.fn().mockReturnValue(['patch']);
                await actions.permissionsExist({ dispatch, getters }, 'name');
                expect(dispatch).toHaveBeenCalledWith('createUpdatePatch', 'name');
                expect(dispatch).toHaveBeenCalledWith(
                    'collections/update',
                    { collection: COLLECTION_TYPES.permissions, id: 'permissionsId', patch: ['patch'] },
                    { root: true },
                );
            });
        });
        describe('permissionsDoNotExist', () => {
            it('Should add permissions object to database. Can only change one at a time, so this only adds the chosen field', async () => {
                const newSettings = { settings: { gridControl: true } };
                await actions.permissionsDoNotExist({ dispatch, getters }, 'gridControl');
                expect(dispatch).toHaveBeenCalledWith(
                    'collections/add',
                    { collection: COLLECTION_TYPES.permissions, item: newSettings },
                    { root: true },
                );
            });
        });
        describe('createComparableCollections', () => {
            it('Should return an editable and original collection.', () => {
                const collections = actions.createComparableCollections({ getters });
                expect(collections).toStrictEqual({ editableCollection, currentCollection });
            });
        });
        describe('createUpdatePatch', () => {
            it('Should create a list of patches for the update.', async () => {
                dispatch = jest.fn().mockReturnValue({ editableCollection, currentCollection });
                const patch = await actions.createUpdatePatch({ dispatch, getters }, 'gridControl');
                const expectedPatch = [
                    {
                        op: 'replace',
                        path: '/settings/gridControl',
                        value: true,
                    },
                ];
                expect(patch).toStrictEqual(expectedPatch);
            });
        });
        describe('loadGmPermissions', () => {
            it('Should load the collection from the database.', async () => {
                await actions.loadGmPermissions({ dispatch });
                expect(dispatch).toHaveBeenCalledWith(
                    'collections/load',
                    { collection: COLLECTION_TYPES.permissions },
                    { root: true },
                );
            });
        });
    });
});
