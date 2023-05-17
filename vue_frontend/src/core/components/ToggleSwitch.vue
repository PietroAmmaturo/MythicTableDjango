<template>
    <label :for="elementId" :class="[{ disabled: isDisabled }, 'toggle']" :style="containerStyle">
        <input :id="elementId" type="checkbox" v-model="localChecked" :disabled="isDisabled" />
        <div :style="indicatorStyle" aria-hidden />
    </label>
</template>

<script>
export default {
    props: {
        elementId: {
            type: String,
            required: true,
        },
        checked: {
            type: Boolean,
            required: true,
        },
        toggleChecked: {
            type: Function,
            required: true,
        },
        checkedColor: {
            type: String,
            default: '#007bff',
        },
        uncheckedColor: {
            type: String,
            default: '#6c757d',
        },
        isDisabled: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        localChecked: {
            get() {
                return this.checked;
            },
            set() {
                this.toggleChecked();
            },
        },
        background() {
            return this.checked ? this.checkedColor : this.uncheckedColor;
        },
        containerStyle() {
            return {
                'background-color': this.background,
            };
        },
        indicatorStyle() {
            return {
                'background-color': this.background,
                left: this.checked ? '' : '1px',
                right: this.checked ? '1px' : '',
            };
        },
    },
};
</script>

<style lang="scss" scoped>
.toggle {
    position: relative;
    min-width: 30px;
    min-height: 15px;
    box-sizing: content-box;
    border-radius: 25% / 50%;
    box-shadow: inset 0 0 5px 3px white;
    div {
        position: absolute;
        top: 1px;
        height: calc(100% - 2px);
        width: calc(50% - 2px);
        box-sizing: border-box;
        border-radius: 50%;
        box-shadow: inset 0 0 2px #343a40;
        border: 1px solid white;
    }
    input[type='checkbox'] {
        opacity: 0;
        position: absolute;
    }
}
.disabled {
    background-color: #f8f9fa !important;
    box-shadow: inset 0 0 6px 3px black;
    div {
        background-color: #f8f9fa !important;
        border: none;
        box-shadow: inset 0 0 2px #343a40;
    }
}
</style>
