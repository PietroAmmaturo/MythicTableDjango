<template>
    <div>
        <Header @profile-activate="showEditor(true)" />
        <router-view></router-view>
        <ProfileEditor />
        <UpdateSplash v-if="showUpdateSplash" @close="closeUpdateSplash" />
        <ErrorDialog />
        <div class="mobile-warning-banner" v-if="showMobileBanner">
            <div>Full Mobile Support is coming soon. For a better experience, visit us from a larger device!</div>
            <img src="/static/icons/layout/close.svg" @click="hideMobileBanner" />
        </div>
    </div>
</template>

<script>
import Header from './Header';
import UpdateSplash from '@/splash/components/UpdateSplash.vue';
import ProfileEditor from '@/profile/components/ProfileEditor.vue';
import ErrorDialog from '@/common/components/ErrorDialog.vue';
import { mapState, mapActions, mapGetters } from 'vuex';
import _ from 'lodash';

export default {
    components: {
        Header,
        ProfileEditor,
        ErrorDialog,
        UpdateSplash,
    },
    data() {
        return {
            showMobileBanner: false,
            showUpdate: true,
            showAdvertSplash: true,
        };
    },
    computed: {
        ...mapGetters('profile', ['showSplash']),
        ...mapState('profile', {
            me: 'me',
        }),
        showUpdateSplash() {
            console.log(`showUpdateSplash() ${this.showSplash}`);
            return this.me && this.showSplash && this.showUpdate;
        },
    },
    mounted() {
        if (window.innerWidth < 450) {
            this.showMobileBanner = true;
        }
    },
    async beforeRouteEnter(to, from, next) {
        try {
            next(async vm => {
                await vm.loadMe();
            });
        } catch (error) {
            next(vm => vm.setError(error));
        }
    },
    methods: {
        ...mapActions('profile', {
            showEditor: 'edit',
            loadMe: 'me',
            update: 'update',
        }),
        hideMobileBanner() {
            this.showMobileBanner = false;
        },
        async closeUpdateSplash() {
            let prof = _.cloneDeep(this.me);
            this.showUpdate = false;
            prof.hasSeenFPSplash = true;
            await this.update(prof);
        },
    },
};
</script>
<style lang="scss" scoped>
.mobile-warning-banner {
    position: fixed;
    top: 0px;
    right: 0px;
    width: 100%;
    height: auto;
    z-index: 10000;
    padding: 0.6em 0.5em;
    background: #c02d0c;
    display: grid;
    grid-template-columns: 1em auto 30px;
    align-items: center;
    div {
        grid-column: 2;
    }
}
</style>
