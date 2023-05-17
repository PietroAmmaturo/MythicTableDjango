<template>
    <div class="header">
        <!-- Mythic Logo -->
        <img
            id="logo"
            v-bind:class="{ faded: !headerToolbarExtended }"
            v-on:click="headerOnClick"
            src="/static/icons/layout/mythic_wolf.svg"
        />
        <div
            id="right_arrow"
            v-on:click="headerOnClick"
            v-bind:class="{ filled_background: headerToolbarExtended, faded: !headerToolbarExtended }"
        >
            <img src="/static/icons/layout/retract-arrow-white.svg" />
        </div>
        <transition name="headerToolbar">
            <div id="toolbar" v-if="headerToolbarExtended" :class="{ faded: !headerToolbarExtended }">
                <ToolbarItem
                    v-if="!drawPanel"
                    id="drawIcon"
                    @clicked="openDrawPanel"
                    image-location="/static/icons/layout/pen-with-line-white.svg"
                    name="Drawing Tool"
                ></ToolbarItem>
                <ExpandedToolbarItem
                    v-if="drawPanel"
                    title="Drawing"
                    titleImageLocation="/static/icons/layout/pen-with-line-white.svg"
                    :status="isDrawing"
                    @close="closeDrawPanel"
                >
                    <DrawingPanel />
                </ExpandedToolbarItem>

                <unleash-feature name="fog-of-war">
                    <ToolbarItem
                        v-if="!fogPanel && hasPermissionFor('fogControl')"
                        id="fog-panel"
                        @clicked="openFogPanel"
                        image-location="/static/icons/fog-of-war/icon.svg"
                        name="Fog of War"
                    />
                </unleash-feature>
                <ExpandedToolbarItem
                    v-if="fogPanel"
                    title="Fog"
                    id="fog-panel-expanded"
                    titleImageLocation="/static/icons/fog-of-war/icon.svg"
                    @close="closeFogPanel"
                    actionImageLocation=""
                >
                    <FogPanel />
                </ExpandedToolbarItem>

                <unleash-feature name="grid-experience-v2">
                    <ToolbarItem
                        v-if="!gridPanel && hasPermissionFor('gridControl')"
                        id="grid-panel"
                        @clicked="openGridPanel"
                        image-location="/static/icons/layout/grid-settings.svg"
                        name="Grid"
                    ></ToolbarItem>
                </unleash-feature>
                <ExpandedToolbarItem
                    v-if="gridPanel"
                    title="Grid"
                    id="grid-panel-expanded"
                    titleImageLocation="/static/icons/layout/grid-settings.svg"
                    @close="closeGridPanel"
                    actionImageLocation=""
                >
                    <GridPanel />
                </ExpandedToolbarItem>

                <ToolbarItem
                    v-if="!accountPanel"
                    id="profile"
                    @clicked="accountPanel = !accountPanel"
                    :image-location="`${me.imageUrl}`"
                    name="Account"
                ></ToolbarItem>
                <ExpandedToolbarItem
                    v-if="accountPanel"
                    title="Account"
                    id="profile-expanded"
                    :titleImageLocation="`${me.imageUrl}`"
                    @close="accountPanel = !accountPanel"
                    actionImageLocation=""
                >
                    <AccountPanel />
                </ExpandedToolbarItem>

                <ToolbarItem
                    v-if="!campaignPanel"
                    @clicked="campaignPanel = !campaignPanel"
                    image-location="/static/icons/layout/campaign-list-icon-white.svg"
                    name="Campaigns"
                ></ToolbarItem>
                <ExpandedToolbarItem
                    v-if="campaignPanel"
                    title="Back to Campaigns"
                    titleImageLocation="/static/icons/layout/campaign-list-icon-white.svg"
                    @close="campaignPanel = !campaignPanel"
                >
                    <CampaignPanel />
                </ExpandedToolbarItem>

                <ToolbarItem
                    @clicked="returnToCampaignList"
                    image-location="/static/icons/layout/back.svg"
                    name="Back to Campaign List"
                ></ToolbarItem>
            </div>
        </transition>
        <div v-if="isGridFinding" class="grid-outline" />
    </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';

import HeaderToolbarItem from './HeaderToolbarItem';
import HeaderExpandedToolbar from './HeaderExpandedToolbar.vue';
import DrawingInterface from './Tools/Drawing/DrawingInterface.vue';
import AccountInterface from './Tools/AccountInterface.vue';
import GridInterface from './Tools/GridInterface.vue';
import FogInterface from './Tools/FogInterface.vue';
import CampaignInterface from './Tools/CampaignInterface.vue';
import { verifyMapOwner } from '@/table/utils/mapPermissions.js';

export default {
    state: {},
    components: {
        ToolbarItem: HeaderToolbarItem,
        ExpandedToolbarItem: HeaderExpandedToolbar,
        DrawingPanel: DrawingInterface,
        AccountPanel: AccountInterface,
        GridPanel: GridInterface,
        FogPanel: FogInterface,
        CampaignPanel: CampaignInterface,
    },
    data() {
        return {
            headerToolbarExtended: true,
            drawPanel: false,
            accountPanel: false,
            campaignPanel: false,
            gridPanel: false,
            fogPanel: false,
            showModal: false,
            modalData: {},
        };
    },
    computed: {
        ...mapState('profile', {
            me: 'me',
        }),
        ...mapState('drawing', {
            isDrawing: 'active',
        }),
        ...mapState('grid', {
            isGridFinding: 'active',
        }),
        ...mapState('fog', {
            isFogEditing: 'active',
        }),
        ...mapState('gamestate', {
            activeMap: 'activeMap',
        }),
        ...mapGetters('hasPermission', {
            hasPermissionFor: 'hasPermissionFor',
        }),
        hasAccess: function() {
            return this.oidcIsAuthenticated || this.$route.meta.isPublic;
        },
        isMapOwner() {
            return verifyMapOwner(this.me, this.activeMap);
        },
    },
    mounted() {
        this.$store.commit('drawing/randomActiveColor');
    },
    methods: {
        ...mapMutations('fog', {
            setFogEditing: 'setActive',
        }),
        ...mapActions(['drawing/toggle', 'toggleDrawing']),
        ...mapActions('collections', {
            updateMap: 'update',
        }),
        ...mapActions('grid', {
            gridFinderToggle: 'toggle',
        }),
        returnToCampaignList() {
            this.$router.push({ path: '/campaign-list' });
        },
        onDraw() {
            this.$store.dispatch('drawing/toggle');
        },
        headerOnClick() {
            this.closeAllPanels();
            this.headerToolbarExtended = !this.headerToolbarExtended;
        },
        closeAllPanels() {
            this.closeDrawPanel();
            this.closeGridPanel();
            this.closeFogPanel();
            this.accountPanel = false;
            this.campaignPanel = false;
        },
        openDrawPanel() {
            this.closeAllPanels();
            this.drawPanel = true;
            if (!this.isDrawing) {
                this.onDraw();
            }
        },
        openGridPanel() {
            this.closeAllPanels();
            this.gridPanel = true;
        },
        openFogPanel() {
            this.closeAllPanels();
            this.fogPanel = true;
            this.setFogEditing(true);
        },
        closeDrawPanel() {
            this.drawPanel = false;
            if (this.isDrawing) {
                this.onDraw();
            }
        },
        closeGridPanel() {
            this.gridPanel = false;
            if (this.isGridFinding) {
                this.gridFinderToggle();
            }
        },
        closeFogPanel() {
            this.fogPanel = false;
            this.setFogEditing(false);
        },
    },
};
</script>

<style lang="scss" scoped>
//the total vertical size of the header, base for calculation of all other element sizes
$logoSize: 95px;
$baseIconSize: $logoSize * 0.45;
$iconPadding: $baseIconSize * 0.25;
$panelPadding: $logoSize * 0.18;

.header {
    position: fixed;
    top: 25px;
    left: 25px;
    display: flex;
    flex-basis: content;
    flex-flow: column nowrap;
    align-items: center;
    user-select: none;
}
/* Compensating for outside CSS rules */
.header * {
    box-sizing: content-box !important;
}
.header #logo {
    width: $logoSize;
    height: $logoSize;
    transition: opacity 0.2s;
    cursor: pointer;
    z-index: 5000;
}
#toolbar::before {
    content: '';
    position: absolute;
    width: $logoSize * 0.5;
    height: $logoSize * 0.7;
}
.faded {
    opacity: 0.3;
    transition: opacity 1s ease 6s !important;
}
.header #right_arrow {
    display: inline-flex;
    justify-content: center;
    background: #31313a;
    height: $logoSize * 0.3;
    margin-top: $logoSize * -0.26;
    margin-bottom: $logoSize * 0.2;
    padding: $logoSize * 0.2 $logoSize * 0.15;
    padding-bottom: $panelPadding;
    padding-top: $logoSize * 0.3;
    z-index: 10;
    cursor: pointer;
    border-radius: 0 0 10px 10px;
}
.header #right_arrow.filled_background {
    padding-top: $panelPadding * 0.5;
    padding-bottom: $logoSize * 0.3;
    transform: scaleY(-1);
    background: #31313a;
    border-radius: 10px 10px 0 0;
    opacity: 1;
}
.header #right_arrow.faded {
    padding-bottom: $panelPadding * 0.5;
}
.header #right_arrow img {
    width: $logoSize * 0.4;
    opacity: 1;
}
.header #toolbar[style*='display: none'] {
    display: flex !important;
    flex-basis: content;
    max-height: $logoSize * 0.15;
    transition: opacity 1s ease 5.1s !important;
}
.header #toolbar,
#toolbar:not([style*='display: none']) {
    width: $baseIconSize + ($iconPadding * 2);
    z-index: 1;
    display: flex;
    flex-direction: column;
    overflow: visible;
    min-height: $logoSize * 0.15;
    position: relative;
}
.header #toolbar .ToolbarItem {
    padding: $iconPadding;
    width: $baseIconSize;
    margin-left: 50%;
    margin-bottom: $logoSize * 0.3;
    display: flex;
    align-items: center;
    white-space: nowrap;
    transform: translateX(-50%);
    background: #31313a;
    border-radius: 50%;
    z-index: 1;
}
.header #toolbar .ToolbarItem#profile {
    padding: 0;
    width: $baseIconSize + $iconPadding * 2;
}
::v-deep .ToolbarItem#profile img {
    height: $baseIconSize + $iconPadding * 2;
}
::v-deep .header-panel#profile-expanded .header-panel-icons .main-image {
    padding: 0;
    width: $baseIconSize + $iconPadding * 2;
    height: $baseIconSize + $iconPadding * 2;
}
.headerToolbar-enter-active {
    transition: opacity 0.75s, transform 0.5s ease;
}
.headerToolbar-leave-active {
    transition: opacity 0.75s ease, transform 0.5s ease;
}
.headerToolbar-enter {
    transform: translateY(-50%);
    opacity: 0;
}
.headerToolbar-leave-to {
    transform: translateY(-50%);
    opacity: 0;
}
.header #toolbar .ToolbarItem#profile::v-deep img {
    border-radius: 50%;
    object-fit: cover;
}
::v-deep .header-panel {
    position: relative;
    display: flex;
    min-height: $logoSize * 0.75;
    min-width: $logoSize * 2;
    width: max-content;
    margin-top: -($panelPadding + 1px);
    margin-left: -($panelPadding + 1px);
    margin-bottom: $logoSize * 0.2;
    padding: $panelPadding;
    background-color: var(--dark);
    border-radius: $logoSize * 0.5 $panelPadding $panelPadding $panelPadding;
}
::v-deep .header-panel > :first-child {
    flex-basis: $baseIconSize + (2 * $iconPadding);
    flex-shrink: 0;
    width: $baseIconSize + (2 * $iconPadding);
    padding-right: $panelPadding;
}
::v-deep .header-panel .header-panel-icons img {
    height: $baseIconSize;
    width: $baseIconSize;
    padding: $iconPadding;
    margin-bottom: $panelPadding;
    display: inline-flex;
    align-items: center;
    white-space: nowrap;
    background: #31313a;
    border: 1px solid var(--secondary);
    border-radius: 50%;
    cursor: pointer;
}
::v-deep .divider {
    height: inherit;
    flex-shrink: 0;
    flex-basis: 2px;
    width: 2px;
    background-color: var(--secondary);
}
::v-deep .close-header-panel {
    position: absolute;
    right: $logoSize * 0.02;
    top: -$logoSize * 0.08;
    width: $panelPadding;
    height: min-content;
    padding: 0;
    background-color: transparent;
}
::v-deep .header-panel:hover .close-header-panel {
    position: absolute;
    right: 0;
    top: 0;
    width: $logoSize * 0.3;
    height: $logoSize * 0.3;
    margin: 0;
    margin-top: -$logoSize * 0.02;
    margin-right: -$logoSize * 0.02;
    padding: $logoSize * 0.02;
    transform: translate(50%, -50%);
    background-color: inherit;
    border-radius: 50%;
    transition: opacity 5s ease 2s;
}
::v-deep .header-panel .header-panel-icons .header-panel-active {
    box-shadow: 0 0 3px var(--white);
}
::v-deep .header-panel > :nth-child(3) {
    display: flex;
    flex-flow: column wrap;
    flex-shrink: 0;
    margin: 0;
    padding: 0;
    padding-left: $panelPadding;
    width: fit-content;
}
.grid-outline {
    position: fixed;
    top: 0;
    left: 0;
    z-index: -1;
    width: 100vw;
    height: 100vh;
    box-sizing: border-box !important;
    background-color: transparent;
    border: 7.5px solid #f14c27;
    pointer-events: none;
}
</style>
