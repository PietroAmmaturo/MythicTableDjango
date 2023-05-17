<template>
    <BaseModal cssid="update-announcement" @escape="close">
        <button class="modal-button" @click="close">Close</button>

        <div class="update-announcement-container">
            <h1>{{ UpdateDetails.releaseHeading }}</h1>
            <h2>{{ UpdateDetails.subhead }}</h2>
            <p>{{ UpdateDetails.text }}</p>
            <div class="feature" v-for="feature in UpdateDetails.newFeatures" :key="feature.name">
                <img :src="feature.img" />
                <div class="info">
                    <h1>{{ feature.name }}</h1>
                    <p>{{ feature.description }}</p>
                </div>
            </div>
            <ul class="socials">
                <li>
                    <a target="_blank" href="https://discord.gg/c4bEWDQ">
                        <img src="/static/icons/social/Discord-Logo-White.svg" /> Discord
                    </a>
                </li>
                <li>
                    <a target="_blank" href="https://www.patreon.com/mythictable">
                        <img src="/static/icons/social/patreon.png" /> Patreon
                    </a>
                </li>
                <li>
                    <a target="_blank" href="https://twitter.com/mythictable"
                        ><img src="/static/icons/social/twitter.png" /> Twitter</a
                    >
                </li>
                <li>
                    <a target="_blank" href="https://www.reddit.com/r/mythictable/">
                        <img src="/static/icons/social/reddit.png" /> Reddit
                    </a>
                </li>
            </ul>
        </div>
    </BaseModal>
</template>
<script>
import BaseModal from '@/core/components/BaseModal.vue';
import UpdateDetails from '@/splash/model/UpdateDetails.js';
export default {
    components: {
        BaseModal,
    },
    props: {
        show: {
            type: Boolean,
        },
    },
    data() {
        return {
            UpdateDetails,
        };
    },
    methods: {
        close() {
            this.$emit('close');
        },
    },
};
</script>

<style lang="scss">
#update-announcement.modal-container {
    max-height: 95vh;
    position: relative;

    .update-announcement-container {
        padding: 2em;
        padding-top: 4em;
        padding-bottom: 5em;
        text-align: center;
        overflow: auto;

        h1 {
            font-weight: 300;
        }
        h2 {
            font-weight: 300;
            font-size: 2em;
            color: #999;
        }
        p {
            font-size: 1.5em;
            line-height: 1.2em;
            color: #fff;
            margin: 1em 0;
        }
        .feature {
            display: grid;
            background: #1c1c1c;
            border-radius: 1em;
            text-align: left;
            padding: 1em;
            min-height: 100px;
            grid-template-columns: 100px auto;
            align-items: center;
            margin: 10px 0;
            img {
                width: 70%;
            }
            &:first {
                margin-top: 100px;
            }
            h1 {
                font-weight: normal;
                font-size: 1.5em;
            }
            p {
                font-size: 1.2em;
                margin: 0;
                color: #aaa;
            }
        }
        .socials {
            list-style: none;
            margin-top: 3em;
            a {
                text-decoration: none;
                color: #fff;
                &:hover {
                    color: #21a0a0;
                }
            }
            li {
                display: inline;
                padding: 0.7em 1em;
                margin: 0 0.5em;
                border-radius: 0.5em;
                background: #1c1c1c;
                cursor: pointer;
                &:hover {
                    background: #1c1c1caa;
                }
                img {
                    height: 1em;
                    margin-right: 1em;
                }
            }
        }
    }
    .modal-button {
        position: absolute;
        bottom: 1.5em;
        right: 1.5em;
    }
}
</style>
