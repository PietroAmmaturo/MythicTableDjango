<template>
    <div class="color-palette">
        <div
            v-bind:key="c"
            v-for="c in colorList"
            :id="c"
            v-bind:style="{ backgroundColor: c }"
            v-bind:class="getColorClass(c)"
            v-on:click="selectColor(c)"
        />
    </div>
</template>

<script>
export default {
    props: {
        colorList: {
            type: Array,
            required: true,
        },
        value: {
            type: String,
            required: true,
            default: '#000000',
        },
    },
    methods: {
        getColorClass(c) {
            return { active: this.value === c };
        },
        selectColor(c) {
            this.$emit('input', c);
        },
    },
};
</script>

<style lang="scss" scoped>
.color-palette {
    display: flex;
    line-height: 0.5rem;
    padding: 0.25rem;
    flex-direction: row;
}

.color-palette > div {
    cursor: pointer;
    border-radius: 100%;
    margin: 0.25rem;
    width: 2rem;
    height: 2rem;
    background: #3a3a3a;
    border: 4px solid #444545;
}

.color-palette > div.active {
    border: 4px solid #cccccc;
}

.color-palette > div:hover:not(.active) {
    opacity: 0.8;
}

.color-palette > div:active:not(.active, .custom) {
    opacity: 0.7;
    transform: scale(0.9);
}
</style>
