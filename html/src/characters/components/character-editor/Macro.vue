<template>
    <li class="macro">
        <div class="text" @click="triggerMacro" v-if="!isEditing">
            {{ macro }}
        </div>
        <div class="edit" @click="edit" v-if="!isEditing && enableEditing">
            <img src="/static/icons/layout/draw.svg" />
        </div>

        <input type="text" v-if="isEditing" v-model="edited" />
        <button class="modal-button no-margin selected submit" v-if="isEditing" @click="save">Save</button>
        <button class="modal-button no-margin cancel" v-if="isEditing" @click="cancel">Cancel</button>
        <button class="modal-button no-margin delete accent-red remove" v-if="isEditing" @click="remove">
            <img src="/static/icons/layout/delete.svg" alt="" />
        </button>
    </li>
</template>

<script>
import moment from 'moment';
import { mapState } from 'vuex';
export default {
    props: {
        macro: {
            type: String,
            required: true,
        },
        index: {
            type: Number,
            required: true,
        },
        context: {
            type: Object,
            required: true,
        },
        enableEditing: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            isEditing: false,
            edited: this.macro,
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
        showEdit() {
            return !this.isEditing;
        },
    },

    methods: {
        triggerMacro() {
            const message = {
                timestamp: +moment(),
                userId: this.me.id,
                displayName: this.me.displayName,
                sessionId: this.sessionId,
                message: this.macro,
                context: this.context,
            };
            this.director.submitRoll(message);
        },
        edit() {
            this.isEditing = !this.isEditing;
            this.$emit('editing');
        },
        save() {
            const { edited, index } = this;
            this.$emit('changed', { edited, index });
            this.edit();
        },
        remove() {
            this.$emit('remove', this.index);
            this.edit();
        },
        cancel() {
            this.edited = this.macro;
            this.edit();
        },
    },
};
</script>

<style lang="scss" scoped>
.macro {
    margin: 0.5em;
    min-height: 40px;
    padding: 8px;
    background: #1e1e1e;
    border-radius: 10px;
    display: grid;
    grid-template-columns: auto auto auto 3em;
    align-content: center;
    padding-left: 1em;
    .edit {
        grid-column: 4;
        cursor: pointer;
    }
    .text {
        user-select: none;
        padding-left: 1.2em;
    }
    img {
        height: 1.2em;
    }
    .modal-button {
        width: auto;
        height: 2.5rem;
        margin: 0 2px;
    }
    input {
        background: #2b2a2a;
    }
}
</style>
