<template>
    <BaseModal v-if="modified" @escape="onCancel">
        <div class="left-panel">
            <div @click="onTokenClicked">
                <CharacterToken
                    :image="modified.image"
                    :mode="modified.borderMode"
                    :color="modified.borderColor"
                    :icon="modified.icon"
                    :editor="true"
                    size="170px"
                />
            </div>
            <input ref="uploader" style="display: none;" type="file" @change="uploadImage" accept="image/*" />
            <div class="helper">
                <span>{{ tokenHelpMessage }}</span>
            </div>
            <div class="tabset">
                <ul>
                    <li :class="checkSelectedTab('description')" @click="changeTab('description')">Description</li>
                    <li :class="checkSelectedTab('token')" @click="changeTab('token')">Token</li>
                </ul>
            </div>
            <div
                v-if="hasPermissionFor('hiddenTokens', modified._userid)"
                class="privacy"
                :class="{ private: modified.private }"
                @click="togglePrivate"
            >
                <div><img :src="visibilityButton.image" /> {{ visibilityButton.text }}</div>
            </div>
        </div>
        <div class="right-panel action-buttons-container" :class="{ private: modified.private }">
            <CharacterDescriptionEditor
                v-if="selectedTab == 'description'"
                v-model="modified"
                @input="onChange"
                @change="onChange"
            />
            <CharacterTokenEditor v-else v-model="modified" @input="onChange" />
            <div class="action-buttons">
                <button ref="characterEditSave" class="modal-button selected" :disabled="!isModified" @click="onSave">
                    Save
                </button>
                <button class="modal-button" @click="onCancel">Cancel</button>
                <button
                    v-if="isTokenOwner(original._userid) || isGameMaster"
                    class="modal-button accent-red delete"
                    @click="onDelete"
                >
                    <img src="/static/icons/layout/delete.svg" />
                </button>
            </div>
        </div>
    </BaseModal>
</template>

<style lang="scss" scoped>
.left-panel {
    position: relative;
    padding: 20px 0px;
    flex: 1 50px;
    background: linear-gradient(180deg, rgb(31, 31, 31) 0%, rgb(3, 3, 3) 100%);
    overflow: hidden;
}
.right-panel {
    flex: 2;
    min-height: 450px;
    max-height: 600px;
    border-left: 0.5em solid #21a0a0;
    transition: border 0.5s;
    &.private {
        border-left: 0.5em solid #c02d0c;
    }
}
.tabset {
    margin-top: 2em;
    margin-bottom: 2em;
    width: 100%;
    ul {
        list-style-type: none;
        margin: 0;
        padding: 0;
        width: 100%;
        li {
            margin: 4px 20px;
            padding: 20px;
            padding-left: 30px;
            border-radius: 1em;
            cursor: pointer;
            transition: background 0.5s;
            font-size: 1.2rem;
            font-weight: 300;
        }
        li.selected {
            background: #2e2e2e;
            font-weight: 400;
        }
        li:hover:not(.selected) {
            background: #222;
        }
    }
}
.privacy {
    position: absolute;
    bottom: 20px;
    right: 0px;
    div {
        margin: 4px 20px;
        padding: 15px 20px;
        padding-left: 30px;
        border-radius: 1em;
        cursor: pointer;
        transition: background 0.5s;
        font-size: 1.2rem;
        font-weight: 300;
        background: #21a0a0;
        text-align: left;
        img {
            height: 1.2em;
            padding-right: 0.25em;
        }
    }
    &.private {
        div {
            background: #c02d0c;
        }
    }
    width: 100%;
}
.helper {
    color: #afafaf;
    text-align: center;
    margin-left: 5em;
    margin-right: 5em;
}
</style>

<script>
import { mapActions, mapState, mapGetters, mapMutations } from 'vuex';
import BaseModal from '@/core/components/BaseModal.vue';
import Token from '@/core/collections/tokens/model';
import * as jsonpatch from 'fast-json-patch';
import _ from 'lodash';

import CharacterToken from '../CharacterToken.vue';
import CharacterTokenEditor from './CharacterTokenEditor.vue';
import CharacterDescriptionEditor from './CharacterDescriptionEditor.vue';
import { addCharacter } from '@/core/api/files/files.js';
import { migrateCharacter } from '@/characters/migration/CharacterMigration.js';

export default {
    components: {
        BaseModal: BaseModal,
        CharacterToken: CharacterToken,
        CharacterTokenEditor,
        CharacterDescriptionEditor,
    },
    data: function() {
        return {
            modified: null,
            selectedTab: 'description',
        };
    },
    computed: {
        ...mapState('characters', {
            original: 'characterToEdit',
        }),
        ...mapState('tokens', {
            selectedToken: 'selectedToken',
        }),
        ...mapGetters('hasPermission', {
            isTokenOwner: 'isItemOwner',
            isGameMaster: 'getGameMasterStatus',
            hasPermissionFor: 'hasPermissionFor',
        }),
        visibilityButton() {
            const buttonOpts = {
                image: '/static/icons/layout/visible.svg',
                text: this.isToken ? 'Visible' : 'Public',
            };
            if (this.modified.private) {
                buttonOpts.image = '/static/icons/layout/invisible.svg';
                buttonOpts.text = this.isToken ? 'Hidden' : 'Private';
            }
            return buttonOpts;
        },
        tokenHelpMessage() {
            if (this.modified.image) {
                return 'Click the token to change the image';
            } else {
                return 'Chose an image before continuing';
            }
        },
        isModified() {
            const patch = jsonpatch.compare(this.original, this.modified);
            return patch.length !== 0;
        },
        isToken() {
            return this.original instanceof Token;
        },
    },
    watch: {
        original: function() {
            if (!_.isEmpty(this.original)) {
                this.modified = migrateCharacter(_.cloneDeep(this.original));
            } else {
                this.modified = null;
            }
        },
    },
    methods: {
        ...mapMutations('tokens', {
            updateSelectedToken: 'updateSelectedToken',
        }),
        ...mapActions('tokens', {
            updateToken: 'update',
            removeToken: 'remove',
        }),
        ...mapActions('characters', {
            addNewCharacter: 'add',
            updateCharacter: 'update',
            removeCharacter: 'remove',
            closeEditor: 'closeEditor',
        }),
        ...mapActions('errors', {
            showError: 'modal',
        }),
        onChange() {
            this.modified = { ...this.modified };
        },
        onTokenClicked(params) {
            this.$refs.uploader.click(params);
        },
        async onSave() {
            const patch = jsonpatch.compare(this.original, this.modified);
            if (patch.length > 0) {
                if (this.original instanceof Token) {
                    await this.updateToken(this.modified);
                    if (this.modified && this.modified._id === this.selectedToken._id) {
                        this.updateSelectedToken(this.modified);
                    }
                } else {
                    if (this.modified._id) {
                        await this.updateCharacter(this.modified);
                    } else {
                        await this.addNewCharacter(this.modified);
                    }
                }
            }
            this.closeEditor();
        },
        onCancel() {
            this.$refs.characterEditSave.disabled = true;
            this.closeEditor();
        },
        checkSelectedTab(tab) {
            return this.selectedTab == tab ? 'selected' : '';
        },
        changeTab(tab) {
            this.selectedTab = tab;
        },
        async uploadImage(event) {
            if (!event) {
                return;
            }
            let files;
            files = event && event.target && event.target.files;
            try {
                const result = await addCharacter(files);
                this.modified.image = result.data.files[0].url;
            } catch (err) {
                this.showError(err);
            }
            this.$refs.uploader.value = '';
        },
        async onDelete() {
            this.deleteItem();
            this.closeEditor();
        },
        async deleteItem() {
            if (this.original instanceof Token) {
                await this.removeToken({ id: this.original._id });
            } else {
                await this.removeCharacter({ id: this.original._id });
            }
        },
        togglePrivate() {
            this.modified.private = !this.modified.private;
            this.onChange();
        },
    },
};
</script>
