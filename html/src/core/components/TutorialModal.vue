<template>
    <BaseModal cssid="tutorial" @escape="close">
        <div class="container">
            <slot />
        </div>
        <button class="modal-button" @click="close">Close</button>
    </BaseModal>
</template>

<script>
import BaseModal from '@/core/components/BaseModal.vue';
export default {
    components: {
        BaseModal,
    },
    methods: {
        close() {
            this.$emit('close');
        },
    },
};
</script>

<style lang="scss" scoped>
img {
    width: 100%;
}
.container {
    box-sizing: content-box;
    margin: 0 35px 0 35px;
    padding: 30px 30px 70px 30px !important;
    overflow: auto;
}
h5 {
    margin: 0 0 1.25rem 0;
    font-size: 2rem;
}
p {
    font-size: 1rem;
    line-height: 1.5rem;
}
.modal-button {
    position: absolute;
    bottom: 1.5em;
    right: 1.5em;
}
</style>
