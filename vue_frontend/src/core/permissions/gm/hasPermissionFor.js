import _ from 'lodash';

const permissionsVerification = {
    namespaced: true,
    getters: {
        hasPermissionFor: (state, getters, rootState, rootGetters) => (specifiedPermission, id = '') => {
            const gameMasterControlActive = rootGetters['gmPermissions/permissionSettings'][specifiedPermission];
            if (gameMasterControlActive) {
                return gmPermissionActiveFor[specifiedPermission]({ getters, id });
            } else {
                return assumedPermissionFor[specifiedPermission]({ getters, id });
            }
        },
        getGameMasterStatus: (state, getters, rootState, rootGetters) => {
            return rootGetters['players/isGameMaster'](getters.currentUserId);
        },
        currentUserId(state, getters, rootState) {
            return rootState.profile.me.id;
        },
        isCampaignOwner(state, getters, rootState) {
            return getters.currentUserId === rootState.campaigns.activeCampaign.owner;
        },
        isCampaignOwnerById: (state, getters, rootState) => userId => {
            return rootState.campaigns.activeCampaign.owner === userId;
        },
        isItemOwner: (state, getters) => itemUserId => {
            return getters.currentUserId === itemUserId;
        },
        isActiveMapOwner(state, getters, rootState) {
            if (!_.isEmpty(rootState.gamestate.activeMap)) {
                return getters.currentUserId === rootState.gamestate.activeMap._userid;
            } else {
                return false;
            }
        },
        gmOrOwner: (state, getters) => itemUserId => {
            return getters.getGameMasterStatus || getters.isItemOwner(itemUserId);
        },
    },
};

const gmPermissionActiveFor = {
    gridControl: ({ getters }) => getters.getGameMasterStatus,
    fogControl: ({ getters }) => getters.getGameMasterStatus,
    editAnyMap: ({ getters, id }) => getters.gmOrOwner(id),
    hiddenTokens: ({ getters, id }) => getters.gmOrOwner(id),
    moveAll: ({ getters }) => getters.getGameMasterStatus,
};

const assumedPermissionFor = {
    gridControl: ({ getters }) => getters.isActiveMapOwner,
    fogControl: ({ getters }) => getters.isActiveMapOwner,
    editAnyMap: ({ getters, id }) => getters.isItemOwner(id),
    hiddenTokens: ({ getters, id }) => getters.isItemOwner(id),
    moveAll: ({ getters, id }) => getters.isItemOwner(id),
};

export default permissionsVerification;
