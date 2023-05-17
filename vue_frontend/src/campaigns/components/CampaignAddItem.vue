<template>
    <div class="campaign" @click="goToCreate">
        <div class="campaign-card add-campaign">
            <img class="plus" src="/static/icons/layout/campaign-plus.svg" />
        </div>
    </div>
</template>
<script>
export default {
    methods: {
        goToCreate() {
            this.$router.push({ path: '/create' });
        },
    },
};
</script>

<style lang="scss">
.campaign-card.add-campaign {
    background: #262626;
    border: #444545 8px solid;
    border-radius: 3em;
    display: flex;
    align-items: center;
    justify-content: center;
    img.plus {
        width: 7em;
        height: 7em;
    }
}
</style>
