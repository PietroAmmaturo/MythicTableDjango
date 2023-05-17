<template>
    <BaseModal>
        <div class="container">
            <h1>{{ title }}</h1>
            <p class="message">{{ message }}</p>
            <button @click="notFocusClick" class="modal-button">{{ notFocusButton }}</button>
            <button @click="focusClick" class="modal-button selected">{{ focusButton }}</button>
        </div>
    </BaseModal>
</template>

<script>
import BaseModal from '@/core/components/BaseModal.vue';
export default {
    components: {
        BaseModal,
    },
    props: {
        title: {
            type: String,
            default: 'Title',
        },
        message: {
            type: String,
            default: 'Message',
        },
        focusButton: {
            type: String,
            default: 'Action Button',
        },
        focusAction: {
            type: Function,
            default: () => null,
        },
        notFocusButton: {
            type: String,
            default: 'Inaction Button',
        },
        notFocusAction: {
            type: Function,
            default: () => null,
        },
    },
    methods: {
        close() {
            this.$emit('close');
        },
        focusClick() {
            this.focusAction();
            this.close();
        },
        notFocusClick() {
            this.notFocusAction();
            this.close();
        },
    },
};
</script>

<style scoped>
.container {
    box-sizing: border-box;
    height: 410px;
    padding: 50px;
    display: flex;
    flex-direction: row-reverse;
    flex-wrap: wrap;
    justify-items: center;
}
h1 {
    width: 100%;
    text-align: center;
    font-weight: 700;
}
button {
    width: 30%;
    align-self: flex-end;
}
.message {
    width: 100%;
    height: 50%;
    padding: 20px;
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    text-align: center;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 400;
}
</style>
