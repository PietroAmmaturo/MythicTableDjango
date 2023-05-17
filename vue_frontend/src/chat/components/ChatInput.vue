<template>
    <div class="chat-input">
        <input
            v-model="message"
            @keydown.enter="sendMessage"
            @keyup.up="getPreviousMessage"
            placeholder="Type a message"
        />
    </div>
</template>

<script>
import moment from 'moment';
import { mapState } from 'vuex';

export default {
    data: function() {
        return {
            message: '',
        };
    },
    computed: {
        ...mapState('live', {
            sessionId: 'sessionId',
            director: 'director',
        }),
        ...mapState('profile', {
            me: 'me',
        }),
    },
    methods: {
        sendMessage() {
            var diceRoll = {
                timestamp: +moment(),
                userId: this.me.id,
                displayName: this.me.displayName,
                sessionId: this.sessionId,
                message: this.message,
            };
            this.director.submitRoll(diceRoll);
            this.message = '';
        },
        sendRoll(roll) {
            var diceRoll = {
                timestamp: +moment(),
                userId: this.me.id,
                displayName: this.me.displayName,
                sessionId: this.sessionId,
                message: roll,
            };
            this.director.submitRoll(diceRoll);
        },
        getPreviousMessage() {
            let log = this.$store.getters['gamestate/rollLog'].filter(msg => msg.userId === this.me.id);
            this.message = log[log.length - 1].message;
        },
    },
};
</script>

<style scoped>
input {
    background: #444;
    color: #fff;
    width: 100%;
    border: 2px solid #1670b100;
    border-radius: 10px;
    transition: border 0.25s linear;
}
input:focus {
    outline: none !important;
    box-shadow: none !important;
    border: 2px solid #274d78;
}
</style>
