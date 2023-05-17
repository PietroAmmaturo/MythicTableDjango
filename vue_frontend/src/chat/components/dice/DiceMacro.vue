<!-- This component is very useful in future, but right now has been removed. -->
<template>
    <div class="die-macro">
        <img v-bind:src="getImage" />
        <div>{{ text }}</div>
    </div>
</template>

<script>
import getDieImage from './getDieImage.js';

export default {
    props: {
        icon: {
            type: Number,
            default: 20,
        },
        text: {
            type: String,
            required: true,
        },
    },
    computed: {
        getImage: function() {
            let img = this.icon || 20;
            return getDieImage(img);
        },
    },
};
</script>
<style scoped>
.die-macro {
    width: auto;
    background: #1c1c1c;
    border-radius: 20px;
    box-sizing: content-box;
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 3px;
    cursor: pointer;
    transition: background 1s;
    user-select: none;
}
.die-macro:hover {
    background: #3d3d3d;
    transition: background 0s;
}
.die-macro:active {
    transform: scale(0.9);
}
.die-macro img {
    height: 20px;
    margin: 10px;
}
.die-macro div {
    margin-right: 15px;
}
</style>
