<template>
    <div class="chat-card">
        <div class="main-message">
            <CharacterToken
                v-if="context && context.image"
                :image="context.image"
                :mode="context.borderMode"
                :color="context.borderColor"
                :icon="context.icon"
                :editor="false"
                :scale="0.2"
                size="35px"
            />
            <img v-else class="profile-picture profile-image-adjustments" :src="getImage(userId)" alt="" />
            <div class="message-body">
                <div v-if="context && context.name" class="username">
                    {{ context.name }}
                    <ProfileBadges v-bind:userId="userId" />
                </div>
                <div v-else class="username">
                    {{ username }}
                    <ProfileBadges v-bind:userId="userId" />
                </div>
                <div v-for="(message, messageIndex) in messages" :key="messageIndex" class="message-content">
                    <component :is="isSingleRoll(message) ? 'DiceRoll' : 'div'" :dice="message.dice[0]">
                        <span
                            :class="getElementClass(element)"
                            v-for="(element, index) in message.elements"
                            :is="isRoll(element) ? 'InlineDiceRoll' : 'span'"
                            v-bind:key="index"
                            :element="element"
                            :title="element.error"
                        >
                            {{ element.text }}
                        </span>
                    </component>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import CharacterToken from '@/characters/components/CharacterToken.vue';
import InlineDiceRoll from './dice/InlineDiceRoll.vue';
import DiceRoll from './dice/DiceRoll';
import ProfileBadges from './ProfileBadges';

export default {
    components: {
        InlineDiceRoll,
        DiceRoll,
        CharacterToken,
        ProfileBadges,
    },
    props: {
        username: {
            type: String,
            required: true,
        },
        messages: {
            type: Array,
            default: function() {
                return [{ message: '', elements: [], dice: [] }];
            },
        },
        userId: {
            type: String,
            required: true,
        },
        context: {
            type: Object,
            default: null,
        },
    },
    computed: {
        ...mapGetters('profile', {
            getImage: 'getImage',
            getProfile: 'getProfile',
            getGroups: 'getGroups',
        }),
        rolls() {
            console.log(this.message);
            return this.message.dice;
        },
    },
    created: async function() {
        if (!this.getProfile(this.userId)) {
            await this.loadProfile(this.userId);
        }
    },
    methods: {
        ...mapActions('profile', {
            loadProfile: 'load',
        }),
        elementClasses(element) {
            if (element.results) return 'highlight';
            return '';
        },
        isRoll(element) {
            return element.results != null;
        },
        isSingleRoll(message) {
            if (message.elements.length != 1) return false;
            if (message.elements[0].results == null) return false;
            return message.elements[0].results.rolls.length != 0;
        },
        getElementClass(element) {
            if (element.error != null) {
                return 'message-text error';
            }
            return 'message-text';
        },
    },
};
</script>

<style lang="scss" scoped>
.chat-card {
    display: flex;
    flex-direction: column;
    width: 100%;
}
.message-content {
    padding: 0.25em 0;
}
.chat-card .main-message {
    color: #fff;
    padding: 10px 20px;
    display: flex;
    flex-direction: row;
    overflow-x: hidden;
    .circleToken.circleClass_selection {
        border: none;
    }
}
.chat-card .main-message .profile-picture {
    height: 35px;
    width: 35px;
}
.chat-card .main-message .message-body {
    width: 100%;
    word-wrap: break-word;
    padding-left: 15px;
    font-weight: 400;
}
.chat-card .main-message .message-body .username {
    font-weight: 600;
    padding-bottom: 5px;
}
.error {
    background: #c02d0c;
    border: 3px #1b1b1b;
    padding: 2px 1ch;
    margin: 2px 0;
    border-radius: 3px;
    display: inline-block;
}
</style>
