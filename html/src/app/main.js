import Vue from 'vue';
import VueMatomo from 'vue-matomo';
import router from './router.js';
import store from './store.js';
import axios from 'axios';

import GameStateStore from '../store/GameStateStore';
import actions from '../core/ruleset/experiment/actions';

import { BootstrapVue, IconsPlugin, BootstrapVueIcons } from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

import VueChatScroll from 'vue-chat-scroll';
import VueMaterial from 'vue-material';
import 'vue-material/dist/vue-material.min.css';
import 'vue-material/dist/theme/default.css';

import Clipboard from 'v-clipboard';
import VTooltip from 'v-tooltip';

import VueFuse from 'vue-fuse';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faKickstarterK } from '@fortawesome/free-brands-svg-icons';
import { faDiceD20 } from '@fortawesome/free-solid-svg-icons';

Vue.config.productionTip = false;

// Install BootstrapVue
Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons);
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin);

Vue.use(VueChatScroll);
Vue.use(VueMaterial);

Vue.use(Clipboard);
Vue.use(VTooltip);

Vue.use(VueFuse);

import '@/common/assets/main.scss';
import '@/common/assets/modal.scss';
import '@/common/assets/tooltip.scss';
import '@/common/assets/icons.css';

import '@/common/assets/scrollbar.css';

// FIXME: find a better place to load in the ruleset than main.js
const ruleset = {
    actions: actions,
};
GameStateStore.state.ruleset = ruleset;
Vue.use(VueMatomo, {
    host: 'https://mythictable.matomo.cloud/',
    siteId: 1,
    router: router,
    enableLinkTracking: true,
    requireConsent: false,
    trackInitialView: true,
    trackerFileName: 'matomo',
    debug: true,
});

library.add(faKickstarterK);
library.add(faDiceD20);
Vue.component('fa-icon', FontAwesomeIcon);

// eslint-disable-next-line no-unused-vars
new Vue({
    el: '#app',
    store,
    router,
    render: h => h('router-view'),
});

// export { store };

// Set up axios interceptor to add API token
// TODO: Restrict this to only add the token if requesting from the original domain
// (so we don't send our SECRET auth token to other websites accidentally)
axios.interceptors.request.use(
    config => {
        if (!(config.hasOwnProperty('disableAuth') && config.disableAuth)) {
            config.headers['Authorization'] = `Bearer ${store.state.oidcStore.access_token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    },
);
