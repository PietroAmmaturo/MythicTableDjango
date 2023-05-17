<template>
    <div class="window" v-bind:class="{ hidden: collapseWindow }">
        <div class="header" @click="collapse">
            <slot name="header" />
        </div>
        <div class="content">
            <slot />
        </div>
    </div>
</template>
<script>
export default {
    props: {
        collapseOnClick: {
            type: Boolean,
            default: true,
        },
    },
    data: function() {
        return {
            collapseWindow: false,
        };
    },
    methods: {
        collapse() {
            if (this.collapseOnClick) {
                this.collapseWindow = !this.collapseWindow;
            }
        },
    },
};
</script>
<style scoped>
.window {
    width: 100%;
    background: #31313aef;
    display: flex;
    flex-direction: column;
    border-radius: 15px;
    overflow: hidden;
    margin: 10px 0px;
    flex-shrink: 1;
    flex-basis: 100vh;
    transition: all 0.5s ease;
    min-height: 300px;
}
.header {
    font-size: 20px;
    color: #fff;
    padding: 15px;
    background: #31313ad8;
    position: relative;
    width: 100%;
    height: 60px;
    min-height: 60px;
    flex-basis: 60px;
    user-select: none;
    backdrop-filter: blur(7px);
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.3);
    font-weight: bold;
    line-height: 30px;
    z-index: 500;
    transition: background 0.5s ease;
    cursor: pointer;
}
.content {
    flex: 1;
    min-height: 0;
    display: flex;
    /* flex-basis: 310px; */
}
.window.hidden {
    flex-basis: 60px;
    min-height: 60px;
    height: 60px;
    transition: all 0.5s ease;
}
.window.hidden .header {
    background: #31313a;
}
</style>
