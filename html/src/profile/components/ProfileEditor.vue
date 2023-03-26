<template>
    <BaseModal v-if="profile" @escape="onCancel">
        <div class="left-panel">
            <fieldset>
                <div class="image-uploader">
                    <div class="upload-overlay"><img src="/static/icons/layout/upload.svg" /> Upload New Photo</div>
                    <img ref="image" class="profile" :src="profile.imageUrl" @click="onImageClicked" />
                </div>
                <input ref="uploader" style="display: none;" type="file" @change="upload" accept="image/*" />
            </fieldset>
            <h2>{{ profile.displayName }}</h2>
        </div>
        <div class="right-panel">
            <fieldset>
                <legend>Display Name</legend>
                <input v-model="profile.displayName" type="textarea" />
            </fieldset>
            <div class="action-buttons">
                <button class="modal-button selected" @click="onSave">{{ saveButton }}</button>
                <button class="modal-button" @click="onCancel">Cancel</button>
            </div>
        </div>
    </BaseModal>
</template>

<style lang="scss" scoped>
.left-panel {
    text-align: center;
    justify-content: center;
    h2 {
        margin-top: 0.5em;
    }
}
.right-panel {
    position: relative;
}
.image-uploader {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    position: relative;
    overflow: hidden;
    transition: border 0.25s;
    cursor: pointer;
    .upload-overlay {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: absolute;
        width: 100%;
        height: 100%;
        background: #000000c7;
        top: 0px;
        right: 0px;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.25s;
        z-index: 20;
        img {
            position: relative;
            height: 2em;
            top: -10px;
        }
    }
    img.profile {
        width: 150px;
        height: 150px;
        object-fit: cover;
    }
}

.image-uploader:hover {
    .upload-overlay {
        opacity: 1;
    }
    img.profile {
        filter: blur(2px);
    }
}
</style>

<script lang="ts">
import { mapState, mapActions } from 'vuex';
import BaseModal from '@/core/components/BaseModal.vue';
import _ from 'lodash';

export default {
    components: {
        BaseModal: BaseModal,
    },
    data: function() {
        return {
            profile: null,
            saveButton: 'Save',
        };
    },
    computed: {
        ...mapState('profile', {
            me: 'me',
            show: 'showEditor',
        }),
    },
    watch: {
        show: {
            handler(show) {
                if (show) {
                    this.profile = _.cloneDeep(this.me);
                }
            },
            immediate: false,
        },
        'me.imageUrl': {
            handler(url) {
                if (url && this.profile) {
                    this.profile.imageUrl = url;
                }
            },
            immediate: false,
        },
    },
    methods: {
        ...mapActions('errors', {
            showError: 'modal',
        }),
        ...mapActions('profile', {
            uploadImage: 'uploadImage',
            update: 'update',
            edit: 'edit',
        }),
        onImageClicked() {
            this.$refs.uploader.click();
        },
        async upload($event) {
            try {
                await this.uploadImage($event);
            } catch (err) {
                this.showError(err);
            }
        },
        async onSave() {
            if (this.profile !== this.me) {
                await this.update(this.profile);
                this.edit(false);
                this.profile = null;
            }
        },
        onCancel() {
            this.edit(false);
            this.profile = null;
        },
    },
};
</script>
