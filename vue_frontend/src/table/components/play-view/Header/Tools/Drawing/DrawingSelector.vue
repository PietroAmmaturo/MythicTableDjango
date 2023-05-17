<template>
    <li v-on:click="handleSelect" :style="baseCircleStyle"></li>
</template>

<script>
export default {
    props: {
        color: {
            type: String,
            default: '#20c997',
        },
        size: {
            type: String,
            default: '1.5rem',
        },
        dispatchTo: {
            type: String,
            required: true,
        },
        selected: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        baseCircleStyle() {
            return {
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
                width: this.size,
                height: this.size,
                backgroundColor: this.selected ? 'var(--dark)' : this.color,
                border: `3px solid ${this.color}`,
                borderRadius: '50%',
                cursor: 'pointer',
            };
        },
    },
    methods: {
        handleSelect() {
            let newData = this.dispatchTo === 'drawing/updateColor' ? this.color : this.size;
            this.$store.dispatch(this.dispatchTo, newData);
        },
    },
};
</script>
