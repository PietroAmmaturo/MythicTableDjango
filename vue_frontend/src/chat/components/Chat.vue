<template>
    <div class="chat-log">
        <!-- Note we have an issue mythictable#407 to look into handling scrolling better than
             just having v-chat-scroll be always -->
        <div class="log" ref="scroller" v-chat-scroll="chatScrollConfig" @v-chat-scroll-top-reached="nextPage">
            <ChatItem
                v-for="(message, index) in textOutput"
                :key="index"
                v-bind:username="message.displayName"
                v-bind:messages="message.result"
                v-bind:context="message.context"
                v-bind:userId="message.userId"
                :timestamp="message.timestamp"
            />
        </div>
        <div class="footer">
            <ChatInput />
        </div>
    </div>
</template>

<script>
import ChatInput from './ChatInput';
import ChatItem from './ChatItem';
import { mapGetters, mapState } from 'vuex';

export default {
    components: {
        ChatInput: ChatInput,
        ChatItem: ChatItem,
    },
    data: function() {
        return {
            isPaging: false,
        };
    },
    computed: {
        ...mapGetters('profile', {
            getImage: 'getImage',
        }),
        ...mapState('live', {
            director: 'director',
        }),
        ...mapGetters('gamestate', {
            rollLog: 'rollLog',
        }),
        chatScrollConfig() {
            return { always: !this.isPaging, smooth: false, notSmoothOnInit: true, handlePrepend: false };
        },
        textOutput() {
            let output = [];
            let prevUserID = '';
            let prevTokenId = '';
            let prevTime = 0;
            //append messages sent by same author within 60s to same ChatItem
            for (const diceResult of this.rollLog) {
                //deep clone the dice result
                let result = { ...diceResult };
                let tokenId = result.context && result.context.id ? result.context.id : '';
                if (prevUserID != result.userId || prevTokenId != tokenId || result.timestamp - prevTime > 60000) {
                    if (!Array.isArray(result.result)) result.result = [result.result];
                    if (!Array.isArray(result.id)) result.id = [result.id];
                    if (!Array.isArray(result.message)) result.message = [result.message];

                    output.push(result);
                } else {
                    output[output.length - 1].result.push(result.result);
                    output[output.length - 1].id.push(result.id);
                    output[output.length - 1].message.push(result.message);
                }
                prevUserID = diceResult.userId;
                prevTokenId = tokenId;
                prevTime = diceResult.timestamp;
            }
            return output;
        },
    },
    watch: {
        rollLog: async function() {
            if (!this.isPaging) {
                await this.$nextTick();
                this.$refs.scroller.scrollTop = this.$refs.scroller.scrollHeight;
            }
        },
    },
    methods: {
        async nextPage() {
            this.isPaging = true;
            await this.director.fetchChatPage();
            this.isPaging = false;
        },
    },
};
</script>

<style scoped>
.chat-log {
    display: flex;
    flex-direction: column;
    height: 100%;
    align-content: stretch;
    width: 100%;
}

.chat-log .log {
    overflow-y: auto;
    height: 100%;
}
.chat-log .footer {
    padding: 7px;
    transition: all 1s;
}
</style>
