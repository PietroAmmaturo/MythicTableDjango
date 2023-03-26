<template>
    <div class="ToolbarItem" @click="onClick" @mouseover="hover = true" @mouseleave="hover = false">
        <img :src="imageLocation" />
        <h4 v-show="hover">
            {{ name }}
            <div />
        </h4>
        <slot />
    </div>
</template>

<script>
/**
 * Header toolbar item component.
 * @displayName Header toolbar item
 */
export default {
    props: {
        /**
         * Location to find the image to create the toolbar item.
         */
        imageLocation: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            hover: false,
        };
    },
    methods: {
        onClick() {
            this.$emit('clicked');
        },
    },
};
</script>
<style>
.ToolbarItem {
    position: relative;
    display: flex;
    flex-direction: row;
    cursor: pointer;
    justify-content: center;
    align-content: center;
}
.ToolbarItem img {
    width: 100%;
    height: 100%;
}
.ToolbarItem:hover h4 {
    display: flex;
    box-sizing: content-box;
    position: absolute;
    left: 100%;
    margin-left: 20px;
    margin-bottom: 0;
    padding: 0.5em 0.75em 0.6em 0.75em;
    line-height: 95%;
    background-color: #31313af1;
    border-radius: 0.7em;
    font-weight: 300;
}
.ToolbarItem:hover h4 div {
    display: flex;
    position: absolute;
    top: 50%;
    right: 100%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border: 6px solid;
    border-color: transparent #31313af1 transparent transparent;
}
</style>
