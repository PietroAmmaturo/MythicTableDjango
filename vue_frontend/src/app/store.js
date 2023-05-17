import AnalyticsStore from '@/core/analytics/store';
import AssetStore from '@/core/assets/AssetStore';
import CampaignsStore from '@/campaigns/store.js';
import CharacterStore from '@/characters/store';
import CollectionStore from '@/core/collections/store';
import DrawingStore from '@/core/drawing/store';
import DropperStore from '@/core/dropper/store/DropperStore';
import EditStore from '@/store/EditStore.js';
import ErrorStore from '@/core/errors/store';
import HasPermissionStore from '@/core/permissions/gm/hasPermissionFor';
import GameStateStore from '@/store/GameStateStore';
import GmPermissionsStore from '@/core/permissions/gm/store';
import GridStore from '@/core/grid/store';
import FogStore from '@/core/fog/store';
import KeyboardStore from '@/core/events/keyboard/store';
import LibraryStore from '@/core/library/store/LibraryStore';
import LivePlayState from '@/core/live/LivePlayState';
import PlayerStore from '@/core/collections/players/store';
import TokenStore from '@/core/collections/tokens/store';
import UserCollectionStore from '@/core/collections/user/UserCollectionStore';
import ProfileStore from '@/profile/store';
import WindowStore from '@/core/events/window/store';
import Vue from 'vue';
import Vuex from 'vuex';
import VueUnleash from '@mythicteam/vue-unleash';
import { oidcSettings } from './oidc';
import { vuexOidcCreateStoreModule } from 'vuex-oidc';

Vue.use(Vuex);

const store = new Vuex.Store({
    modules: {
        live: LivePlayState,
        gamestate: GameStateStore,
        oidcStore: vuexOidcCreateStoreModule(
            oidcSettings,
            {
                dispatchEventsOnWindow: true,
            },
            {
                // remove in prod
                userLoaded: user => {
                    console.log('OIDC user is loaded:', user);
                    window._paq.push(['setUserId', user.profile.email]);
                },
                userUnloaded: () => console.log('OIDC user is unloaded'),
                accessTokenExpiring: () => console.log('Access token will expire'),
                accessTokenExpired: () => console.log('Access token did expire'),
                silentRenewError: () => console.log('OIDC user is unloaded'),
                userSignedOut: () => console.log('OIDC user is signed out'),
                oidcError: payload => console.log(`An error occured at ${payload.context}:`, payload.error),
            },
        ),
        assets: AssetStore,
        dropper: DropperStore,
        library: LibraryStore,
        collections: CollectionStore,
        userCollections: UserCollectionStore,
        campaigns: CampaignsStore,
        players: PlayerStore,
        characters: CharacterStore,
        tokens: TokenStore,
        drawing: DrawingStore,
        grid: GridStore,
        fog: FogStore,
        gmPermissions: GmPermissionsStore,
        hasPermission: HasPermissionStore,
        profile: ProfileStore,
        keyboard: KeyboardStore,
        window: WindowStore,
        analytics: AnalyticsStore,
        errors: ErrorStore,
        editingModes: EditStore,
    },
});

Vue.use(VueUnleash, {
    appName: process.env.VUE_APP_FEATURE_FLAG_NAME,
    host: 'https://gitlab.com/api/v4/feature_flags/unleash/14052249',
    instanceId: 'NZMy_McbTgHfknzonaEj',
    store,
    provider: 'gitlab',
});

export default store;
