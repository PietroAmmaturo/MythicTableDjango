import Vue from 'vue';
import VueRouter from 'vue-router';
import store from './store.js';
import { vuexOidcCreateRouterMiddleware } from 'vuex-oidc';
import { oidcSettings } from './oidc.js';

Vue.use(VueRouter);

const routes = [
    {
        path: '/play/:sessionId/:mapId',
        name: 'live-play',
        component: () => import('@/table/components/LivePlay'),
        props: true,
    },
    {
        path: '/oidc',
        name: 'oidcCallback',
        component: () => import('@/app/components/OidcCallback.vue'),
    },
    {
        path: '/',
        name: 'layout',
        component: () => import('@/campaigns/components/Manager'),
        children: [
            {
                path: 'invite/:id',
                component: () => import('@/campaigns/components/CampaignInvitation'),
                name: 'campaign-invite',
            },
            {
                path: 'edit/:id?',
                component: () => import('@/campaigns/components/CampaignEditPage'),
                name: 'campaign-edit',
                alias: 'create',
            },
            {
                path: '*',
                component: () => import('@/campaigns/components/CampaignList'),
                name: 'campaign-list',
            },
        ],
    },
    {
        path: '/ext/auth/profile',
        name: 'profile',
        redirect: () => {
            window.location.href = `${oidcSettings.authority}/account?referrer=${oidcSettings.clientId}&referrer_uri=${window.location.href}`;
            return '/redirecting';
        },
    },
];

export const newTabRoutes = {
    campaigns: function() {
        let newTabAddress = router.resolve({ path: '/campaign-list' });
        window.open(newTabAddress.href, '_blank', 'noopener,noreferrer');
    },
    accountProfile: function() {
        let newTabAddress = `${oidcSettings.authority}/account?referrer=${oidcSettings.clientId}&referrer_uri=${window.location.href}`;
        window.open(newTabAddress, '_blank', 'noopener,noreferrer');
    },
};

const router = new VueRouter({
    routes,
    mode: 'history',
});
router.beforeEach(vuexOidcCreateRouterMiddleware(store));

export default router;
