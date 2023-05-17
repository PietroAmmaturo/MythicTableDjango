<template>
    <BaseModal cssid="splash" @escape="close">
        <button class="modal-button" @click="close">Close</button>
        <a href="https://www.kickstarter.com/projects/mythictable/mythic-table" target="_blank" rel="noreferrer">
            <img
                src="static/images/splash/kickstarter/KickstarterImage.png"
                alt="Check out our Kickstarter! We want to make your games even more Mythic."
            />
        </a>
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
.modal-button {
    position: absolute;
    bottom: 1.5em;
    right: 1.5em;
}
</style>
