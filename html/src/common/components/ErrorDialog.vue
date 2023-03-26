<template>
    <BaseModal v-if="message" @escape="close">
        <div class="container">
            <h1>Error</h1>
            <div class="message">{{ message }}</div>
            <button class="modal-button selected" @click="close">Okay</button>
        </div>
    </BaseModal>
</template>

<script lang="ts">
import { mapState } from 'vuex';
import BaseModal from '@/core/components/BaseModal.vue';

export default {
    components: {
        BaseModal: BaseModal,
    },
    computed: {
        ...mapState('errors', {
            message: 'modalMessage',
        }),
    },
    methods: {
        close: function() {
            this.$store.dispatch('errors/close');
        },
    },
};
</script>

<style scoped>
.container {
    height: 410px;
    padding: 50px;
    display: grid;
    grid: 1fr 5fr 1fr / 1fr;
    row-gap: 30px;
    justify-items: center;
}
h1 {
    text-align: center;
    font-weight: 700;
}
button {
    width: 33%;
}
.message {
    width: 100%;
    padding: 20px;
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 400;
}
</style>
