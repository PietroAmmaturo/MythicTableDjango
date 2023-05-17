import _ from 'lodash';
import * as jsonpatch from 'fast-json-patch';

import { COLLECTION_TYPES } from '@/core/collections/constants';

export const defaultPermissions = {
    deleteToken: true,
    editAnyMap: true,
    gridControl: false,
    fogControl: false,
    hiddenTokens: false,
    moveAll: false,
};

function setLocalPermissions(permissions) {
    const allPermissions = _.cloneDeep(defaultPermissions);
    Object.assign(allPermissions, permissions);
    return allPermissions;
}

const gmPermissionsStore = {
    namespaced: true,
    state: {
        displayGmControlsModal: false,
    },
    getters: {
        permissions(state, getters, rootState, rootGetters) {
            return rootGetters['collections/getCollection'](COLLECTION_TYPES.permissions);
        },
        permissionsKey(state, getters) {
            const onlyPermissionsItemKey = Object.keys(getters.permissions)[0];
            return onlyPermissionsItemKey;
        },
        permissionSettings(state, getters) {
            const { permissions, permissionsKey } = getters;
            if (!_.isEmpty(permissions)) {
                return setLocalPermissions(permissions[permissionsKey].settings);
            } else {
                return defaultPermissions;
            }
        },
    },
    mutations: {
        toggleDisplayGmControlsModal(state) {
            state.displayGmControlsModal = !state.displayGmControlsModal;
        },
    },
    actions: {
        async setGmPermissionSetting({ dispatch, getters }, toggledPermission) {
            if (!_.isEmpty(getters.permissions)) {
                dispatch('permissionsExist', toggledPermission);
            } else {
                dispatch('permissionsDoNotExist', toggledPermission);
            }
        },
        async permissionsExist({ dispatch, getters }, permissionName) {
            const patch = await dispatch('createUpdatePatch', permissionName);
            if (patch.length > 0) {
                dispatch(
                    'collections/update',
                    {
                        collection: COLLECTION_TYPES.permissions,
                        id: getters.permissionsKey,
                        patch,
                    },
                    { root: true },
                );
            }
        },
        async permissionsDoNotExist({ dispatch, getters }, permissionName) {
            const setting = { [permissionName]: !getters.permissionSettings[permissionName] };
            const permissions = { settings: setting };
            dispatch(
                'collections/add',
                { collection: COLLECTION_TYPES.permissions, item: permissions },
                { root: true },
            );
        },
        createComparableCollections({ getters }) {
            const currentCollection = getters.permissions[getters.permissionsKey];
            const editableCollection = _.cloneDeep(currentCollection);
            return { editableCollection, currentCollection };
        },
        async createUpdatePatch({ dispatch, getters }, permissionName) {
            const { editableCollection, currentCollection } = await dispatch('createComparableCollections');
            Object.assign(editableCollection.settings, {
                [permissionName]: !getters.permissionSettings[permissionName],
            });
            return jsonpatch.compare(currentCollection, editableCollection);
        },
        async loadGmPermissions({ dispatch }) {
            return await dispatch('collections/load', { collection: COLLECTION_TYPES.permissions }, { root: true });
        },
    },
};

export default gmPermissionsStore;
