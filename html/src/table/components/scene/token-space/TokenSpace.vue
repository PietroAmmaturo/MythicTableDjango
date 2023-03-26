<template>
    <v-group :config="tokenSpaceConfig">
        <PlayToken
            ref="playTokens"
            v-for="entity in mapTokens"
            :key="entity._id"
            :entity="entity"
            :gridSize="stage.grid.size"
            @moved="onTokenMoved"
            @selected="onTokenSelected"
            @deselected="onTokenDeselected"
            @dblclick="onTokenEdited"
        />
    </v-group>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import jsonpatch from 'fast-json-patch';
import _ from 'lodash';

import PlayToken from '@/characters/components/PlayToken';

export default {
    components: {
        PlayToken,
    },
    props: {
        stage: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            selectedTokenId: '',
        };
    },
    computed: {
        ...mapState('gamestate', {
            activeMap: 'activeMap',
        }),
        ...mapGetters('tokens', {
            getToken: 'getToken',
            getTokensByMapId: 'getTokensByMapId',
        }),
        ...mapGetters('hasPermission', {
            isTokenOwner: 'isItemOwner',
            isGameMaster: 'getGameMasterStatus',
            hasPermissionFor: 'hasPermissionFor',
        }),
        mapTokens() {
            const mapId = this.activeMap?._id;
            const allTokens = this.getTokensByMapId(mapId);
            return allTokens.filter(this.filterToken);
        },
        tokenSpaceConfig() {
            let config;
            if (!this.activeMap) {
                config = {};
            } else {
                config = {
                    position: {
                        x: this.stage.grid.offset?.x ?? 0,
                        y: this.stage.grid.offset?.y ?? 0,
                    },
                };
            }
            return config;
        },
    },
    methods: {
        ...mapActions('tokens', {
            addToken: 'add',
        }),
        ...mapActions('characters', {
            openCharacterEditor: 'openEditor',
        }),
        onTokenMoved: function({ entity, position }) {
            let gridPos = {
                q: position.x / this.stage.grid.size,
                r: position.y / this.stage.grid.size,
            };

            if (!('snap' in this.activeMap.stage.grid) || this.activeMap.stage.grid.snap) {
                gridPos = {
                    q: Math.round(gridPos.q),
                    r: Math.round(gridPos.r),
                };
            }

            const updatedEntity = _.cloneDeep(entity);
            updatedEntity.pos = gridPos;
            const patch = jsonpatch.compare(entity, updatedEntity);

            if (patch.length) {
                this.$store.dispatch('analytics/pushEvent', {
                    event: { category: 'CampaignMap', action: 'CharacterMoved', name: entity },
                });
                this.$store.dispatch('tokens/moveToken', updatedEntity);
            } else {
                this.$store.commit('collections/forceReactivityUpdate', { collection: 'tokens', item: updatedEntity });
            }
        },
        onTokenSelected: function({ entity }) {
            if (this.selectedTokenId === '') {
                this.selectedTokenId = entity._id;
            } else if (this.selectedTokenId !== entity._id) {
                let oldSelectedTokenId = this.selectedTokenId;
                let oldToken = this.$refs['playTokens'].find(token => token.entity._id === oldSelectedTokenId);
                if (oldToken) {
                    oldToken.selected = false;
                }
                this.selectedTokenId = entity._id;
            } else {
                return;
            }
            this.updateSelectedTokenStore();
        },
        onTokenDeselected: function() {
            this.selectedTokenId = '';
            this.updateSelectedTokenStore();
        },
        onTokenEdited: function({ character }) {
            this.openCharacterEditor(character);
        },
        updateSelectedTokenStore() {
            this.$store.commit('gamestate/selectedTokenUpdate', this.selectedTokenId);
        },
        onDelete() {
            this.removeToken();
        },
        removeToken() {
            const { _userId } = this.getToken(this.selectedTokenId);
            if (this.isTokenOwner(_userId) || this.isGameMaster) {
                const tokenIdToBeDeleted = this.selectedTokenId;
                this.onTokenDeselected();
                this.$store.dispatch('tokens/remove', {
                    id: tokenIdToBeDeleted,
                });
            }
        },
        filterToken(token) {
            const isNotHidden = !(token.private ?? true);
            return isNotHidden || this.hasPermissionFor('hiddenTokens', token._userid);
        },
    },
};
</script>
