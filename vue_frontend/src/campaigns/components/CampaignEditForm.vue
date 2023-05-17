<template>
    <BaseModal variant="minified" @escape="exitEditor">
        <section class="campaign-create">
            <h1 v-if="campaignData.id === null">Create New Campaign</h1>
            <h1 v-else>Edit Campaign</h1>
            <label for="campaign-name">
                Campaign Name
            </label>
            <input id="campaign-name" v-model="campaignData.name" type="text" />
            <label for="campaign-description">
                Campaign Description
            </label>
            <textarea
                cols="68"
                rows="5"
                maxlength="310"
                id="campaign-description"
                v-model="campaignData.description"
            ></textarea>
            <label>Campaign Image</label>
            <form enctype="multipart/form-data" novalidate class="banner-upload">
                <label
                    :class="['dropbox', { 'dropbox-hidden': campaignData.imageUrl }]"
                    :style="{ backgroundImage: `url(${campaignData.imageUrl})` }"
                >
                    <input
                        type="file"
                        ref="uploader"
                        @change="previewFile"
                        accept="image/*"
                        class="input-file"
                        id="campaign-upload"
                    />
                    <div class="dropbox_target">
                        <p>
                            Drag your image here<br />
                            or click to browse
                        </p>
                        <svg width="30" height="30" x="0px" y="0px" viewBox="0 0 477.827 477.827" class="icon">
                            <path
                                d="M441.537,160.632c1.489-7.981,2.243-16.082,2.253-24.201C443.699,61.026,382.498-0.028,307.093,0.062
                                        c-57.402,0.069-108.63,36.034-128.194,89.999c-35.029-13.944-74.73,3.148-88.675,38.177c-1.207,3.032-2.195,6.146-2.956,9.319
                                        c-55.932,8.365-94.492,60.488-86.127,116.42c7.502,50.163,50.596,87.275,101.316,87.254h85.333
                                        c9.426,0,17.067-7.641,17.067-17.067c0-9.426-7.641-17.067-17.067-17.067h-85.333c-37.703,0-68.267-30.564-68.267-68.267
                                        s30.564-68.267,68.267-68.267c9.426,0,17.067-7.641,17.067-17.067c0.031-18.851,15.338-34.108,34.189-34.077
                                        c8.915,0.015,17.471,3.517,23.837,9.757c6.713,6.616,17.519,6.537,24.135-0.176c2.484-2.521,4.123-5.751,4.69-9.245
                                        c9.264-55.733,61.954-93.403,117.687-84.139c55.733,9.264,93.403,61.954,84.139,117.687c-0.552,3.323-1.269,6.617-2.146,9.869
                                        c-1.962,7.124,0.883,14.701,7.049,18.773c31.416,20.845,39.985,63.212,19.139,94.628c-12.617,19.015-33.9,30.468-56.72,30.522
                                        h-51.2c-9.426,0-17.067,7.641-17.067,17.067c0,9.426,7.641,17.067,17.067,17.067h51.2
                                        c56.554-0.053,102.357-45.943,102.303-102.497C477.798,208.632,464.526,180.066,441.537,160.632z"
                            />
                            <path
                                d="M353.456,243.832l-85.333-85.333c-1.589-1.593-3.481-2.852-5.564-3.703c-4.175-1.726-8.864-1.726-13.039,0
                                        c-2.083,0.852-3.974,2.111-5.564,3.703l-85.333,85.333c-6.548,6.78-6.36,17.584,0.42,24.132c6.614,6.387,17.099,6.387,23.712,0
                                        l56.235-56.201v248.934c0,9.426,7.641,17.067,17.067,17.067c9.426,0,17.067-7.641,17.067-17.067V211.764l56.201,56.201
                                        c6.78,6.548,17.584,6.36,24.132-0.42C359.844,260.931,359.844,250.445,353.456,243.832z"
                            />
                        </svg>
                    </div>

                    <div class="loading-bar" v-if="isLoading">
                        <md-progress-bar class="md-primary centered" md-mode="indeterminate"></md-progress-bar>
                    </div>
                </label>
            </form>
            <div class="create">
                <button class="modal-button selected" v-if="campaignData.id === null" @click="saveCampaign">
                    Create
                </button>
                <button class="modal-button selected" v-else @click="saveEditedCampaign">Save</button>
                <button class="modal-button" @click="exitEditor">Cancel</button>
            </div>
        </section>
    </BaseModal>
</template>

<script>
import axios from 'axios';
import moment from 'moment';
import { mapActions } from 'vuex';

import BaseModal from '@/core/components/BaseModal.vue';

export default {
    components: {
        BaseModal,
    },
    props: {
        campaign: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            file: '',
            isLoading: false,
        };
    },
    computed: {
        campaignData() {
            return Object.assign({}, this.campaign);
        },
    },
    methods: {
        ...mapActions('errors', {
            showError: 'modal',
        }),
        ...mapActions('campaigns', {
            createCampaign: 'createCampaign',
            updateCampaign: 'updateCampaign',
        }),
        async saveCampaign() {
            let date = new Date();
            this.campaignData.created = moment(date, 'YYYY-MM-DD').format('MM/DD/YYYY');

            //if they do not upload an image, give them one of the default ones
            if (!this.campaignData.imageUrl) {
                const defaultImages = [
                    '/static/assets/campaigns/default.jpg',
                    '/static/assets/campaigns/default-green.jpg',
                    '/static/assets/campaigns/default-blue.jpg',
                    '/static/assets/campaigns/default-orange.jpg',
                ];
                //choose a random image from the array
                this.campaignData.imageUrl = defaultImages[Math.floor(Math.random() * defaultImages.length)];
            }

            await this.createCampaign(this.campaignData);
            //add the campaign
            this.$store.dispatch('analytics/pushEvent', {
                event: {
                    category: 'Campaign',
                    action: 'Create',
                    name: this.campaignData.name,
                    value: this.campaignData.id,
                },
            });
            this.$emit('finished', { saved: true });
        },
        async saveEditedCampaign() {
            await this.updateCampaign(this.campaignData);
            this.$emit('finished', { saved: true });
        },
        async previewFile(event) {
            this.file = event.target.files[0];

            const reader = new FileReader();

            if (this.file) {
                this.isLoading = true;
                await reader.readAsDataURL(this.file);
                let app = this;
                reader.onloadend = app.submitImage;
            }

            this.$refs.uploader.value = '';
        },
        async submitImage() {
            const data = new FormData();
            data.append('files', this.file);
            try {
                const resp = await axios.post('/api/files?path=campaign', data, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                if (resp) {
                    this.campaignData.imageUrl = resp.data.files[0].url;
                    this.$store.dispatch('analytics/pushEvent', {
                        event: {
                            category: 'Campaign',
                            action: 'AddImage',
                            name: this.campaignData.imageUrl,
                            value: this.campaignData.id,
                        },
                    });
                }
            } catch (error) {
                this.campaignData.imageUrl = '';
                this.file = '';
                if (error.response && error.response.status === 413) {
                    this.showError(new Error('File size is too large (should be 32MB or smaller)'));
                } else {
                    this.showError(error);
                }
            }
            this.isLoading = false;
        },
        exitEditor() {
            this.$emit('finished', { saved: false });
        },
    },
};
</script>

<style lang="scss" scoped>
//inner container
$campaign-border-radius: 40px;
$item-spacing: 10px;
.campaign-create {
    flex-grow: 0;
    padding: $campaign-border-radius;
    display: flex;
    flex-direction: column;
    width: 100%;

    h1 {
        font-weight: 700 !important;
    }

    h3 {
        margin: 0;
    }

    img:placeholder-shown {
        color: white;
    }

    & > label {
        margin-top: $item-spacing;
    }
}
.campaign-create h1,
.preview-image {
    position: relative;
    padding: 0;
    margin-top: 5px;
    margin-left: 0px;
    margin-bottom: 25px;
    font-weight: normal;
    color: white;
}
.create {
    margin-top: $item-spacing;
    text-align: right;
}
.modal-button {
    margin: 0px 5px;
}
.progress-bar-div {
    float: left;
}

.image-url {
    margin-left: auto;
    margin-right: auto;
    position: relative;
    top: 1px;
    padding: 0px;
    bottom: 25px;
    border: 1px solid black;
    margin-bottom: 10px;
    object-fit: cover;
    z-index: 1;
}

.banner-upload {
    border-radius: 10px;
    cursor: pointer;
}
.banner-dimension {
    position: relative;
    color: gray;
    font-size: 1rem;
    top: 8px;
    left: 18px;
}

.md-progress-bar {
    opacity: 0.5;
    height: 150px;
    width: 100%;
    text-align: center;
    z-index: 1;
    cursor: pointer;
}

.image-container {
    position: relative;
    text-align: center;
    color: gray;
    font-size: 0.75rem;
    font-weight: 100;
}

.dropbox {
    background: #444;
    background-size: cover;
    background-position: 50%;
    cursor: pointer;
    transition: background 1s;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 0.5rem;
    height: 10rem;
    color: #afafaf;
    font-size: 1.5rem;
    user-select: none;
    position: relative;
}

.dropbox_target {
    border: 1px dashed grey;
    color: white;
    flex: 1 1 1px;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: absolute;
    width: calc(100% - 1rem);
    height: calc(100% - 1rem);
    pointer-events: none;
}

.dropbox-hidden {
    .dropbox_target {
        background: rgba(68, 68, 68, 0.9);
        opacity: 0;
        transition: opacity 0.3s ease-in;
    }

    &:hover {
        .dropbox_target {
            opacity: 1;
        }
    }
}

.dropbox:not(.dropbox-hidden):hover {
    background: #2c2c2c;
}

.dropbox p {
    font-size: 0.8rem;
    text-align: center;
}

.input-file {
    height: 100%;
    width: 100%;
    opacity: 0;
    cursor: pointer;
}

.icon {
    opacity: 1;
    width: 30px;
    z-index: 10;
    fill: white;
}
.centered {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

//fade transition
.fade-enter-active,
.fade-leave-active {
    transition: opacity 2s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
}
</style>
