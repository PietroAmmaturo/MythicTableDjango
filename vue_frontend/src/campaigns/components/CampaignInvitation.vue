<template>
    <div class="invitation-container">
        <div class="preview-background" :style="{ 'background-image': `url(${campaignImage})` }" />
        <div class="inner-container" v-if="!error">
            <div class="banner" :style="{ 'background-image': `url(${campaignImage})` }" />
            <div class="main-info">
                <h1 class="title">{{ title }}</h1>
                <!-- MARK: Author's name and Profile Picture534 -->
                <div class="owner">
                    {{ ownerName }}
                    <img class="profile-image-adjustments" :src="getImage(owner)" />
                </div>
            </div>
            <div class="description">{{ description }}</div>
            <div class="bottom-buttons">
                <div>You have been invited to {{ title }}.</div>
                <button class="modal-button selected" @click="joinCampaign">Join Campaign</button>
                <router-link :to="{ name: 'campaign-list' }" tag="button" class="modal-button">Decline</router-link>
            </div>
        </div>
        <div v-if="error">
            {{ error }}
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { mapGetters, mapActions } from 'vuex';
export default {
    data() {
        return {
            joinId: '',
            campaignId: '',
            campaignImage: '',
            description: '',
            owner: '',
            title: '',
            error: '',
        };
    },
    computed: {
        ...mapGetters(['oidcUser']),
        ...mapGetters('profile', {
            getImage: 'getImage',
            getProfile: 'getProfile',
        }),
        ownerName() {
            if (this.getProfile(this.owner)) {
                return this.getProfile(this.owner).displayName;
            }
            return '';
        },
    },
    beforeRouteEnter(to, from, next) {
        axios
            .get(`/api/campaigns/join/${to.params.id}`)
            .then(response => {
                next(vm => {
                    vm.joinId = to.params.id;
                    vm.setData(response.data);
                });
            })
            .catch(error => {
                next(vm => vm.setError(error));
            });
    },
    created: async function() {
        if (!this.getProfile(this.owner)) {
            await this.loadProfile(this.owner);
        }
    },
    methods: {
        ...mapActions('profile', {
            loadProfile: 'load',
        }),
        setData(data) {
            console.log(data);
            this.owner = data.owner;
            this.title = data.name;
            this.campaignId = data.id;
            this.campaignImage = data.imageUrl;
            this.description = data.description;
        },
        setError(/*error*/) {
            this.error = 'Error loading campaign invitation.';
        },
        joinCampaign() {
            axios.put(`/api/campaigns/join/${this.joinId}`).then(() => this.$router.push('/'));
        },
    },
};
</script>

<style lang="scss" scoped>
.invitation-container {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}
.preview-background {
    position: fixed;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    z-index: 0;
    filter: blur(60px);
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
}
$border-radius: 40px;
.inner-container {
    background: #1c1c1cd2;
    min-width: 700px;
    width: 40vw;
    min-height: 500px;
    border-radius: $border-radius;
    padding: $border-radius;
    box-shadow: 0px 0px 20px #00000062;
    z-index: 10;
    position: relative;
    padding-top: 320px;
    padding-bottom: 120px;
    overflow: hidden;
    text-align: right;
}
.description {
    color: #fff;
    padding-bottom: 20px;
    text-align: justify;
    font-size: 18px;
    line-height: 1.25em;
    text-align: justify;
}
.banner {
    height: 300px;
    width: 100%;
    background-size: cover;
    background-position: center;
    position: absolute;
    top: 0px;
    right: 0px;

    padding: 5px $border-radius;
}
.main-info {
    width: 100%;
    max-width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    overflow: hidden;
    h1 {
        margin-bottom: -5px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        font-weight: 700;
    }

    padding: 10px 0px;
    .owner {
        display: flex;
        align-items: center;
        color: #8b8b8b;
        font-size: 1.5em;
        font-weight: 400;
        white-space: nowrap;
        img {
            height: 1.5em;
            width: 1.5em;
            margin-left: 10px;
        }
    }
}
.bottom-buttons {
    position: absolute;
    bottom: $border-radius;
    right: $border-radius;
    div {
        color: #bbb;
    }
}
.selected {
    margin: 0px 10px;
}
</style>
