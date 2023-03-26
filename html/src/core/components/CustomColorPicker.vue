<template>
    <div class="custom-color-picker">
        <div
            class="color-pad"
            ref="padContainer"
            :style="colorPadBackground"
            @mousedown="handleMouseDown"
            @touchmove="handleChange"
            @touchstart="handleChange"
        >
            <div class="gradient g-white"></div>
            <div class="gradient g-black"></div>
            <div class="thumb" :style="{ bottom: `${v}%`, left: `${s}%` }"></div>
        </div>
        <div class="hue-slider">
            <VueSlider
                v-model="h"
                :max="360"
                direction="ttb"
                height="100%"
                :process="false"
                tooltip="none"
                :dragOnClick="true"
                :railStyle="hueSelectorRailStyle"
                @change="updateColor"
            />
        </div>
        <div class="buttons">
            <input type="text" v-model="form" @input="changeFromFormInput" />
            <button class="modal-button selected" @click="$emit('close')">Done</button>
        </div>
    </div>
</template>

<script>
import VueSlider from 'vue-slider-component';
import tinycolor from 'tinycolor2';
import throttle from 'lodash.throttle';
import clamp from 'clamp';

export default {
    components: {
        VueSlider,
    },
    props: {
        initialColor: {
            type: String,
            default: '#ff0000',
        },
    },
    data() {
        return {
            h: 0,
            s: 100,
            v: 100,
            //model for the color input field
            form: '#ff0000',
            //css background for the hue selector rail
            hueSelectorRailStyle:
                'linear-gradient(to right, red 0%, #ff0 17%, lime 33%, cyan 50%, blue 66%, #f0f 83%, red 100%)',
        };
    },
    computed: {
        //main backgorund color of the color pad
        colorPadBackground() {
            return `background-color: hsl(${this.h}, 100%, 50%)`;
        },
        HSVColor: {
            get: function() {
                return {
                    h: this.h,
                    s: this.s,
                    v: this.v,
                };
            },
            set: function(newColor) {
                let hsv = newColor.toHsv();
                this.h = hsv.h;
                this.s = Math.round(hsv.s * 100);
                this.v = Math.round(hsv.v * 100);
            },
        },
    },
    mounted() {
        this.HSVColor = tinycolor(this.initialColor);
        this.form = this.initialColor;
    },
    methods: {
        throttle: throttle(fn => fn(), 20, { leading: true, trailing: false }),
        changeFromFormInput() {
            let newColor = tinycolor(this.form);
            if (newColor.isValid()) {
                this.HSVColor = newColor;
                this.updateColor(true);
            }
        },
        updateColor(blockform) {
            let newColor = tinycolor(this.HSVColor);
            if (!blockform) this.form = newColor.toHexString();
            this.$emit('color', newColor.toHexString());
        },

        // Color Pad
        handleMouseDown() {
            window.addEventListener('mousemove', this.handleChange);
            window.addEventListener('mouseup', this.handleChange);
            window.addEventListener('mouseup', this.handleMouseUp);
        },
        handleMouseUp() {
            window.removeEventListener('mousemove', this.handleChange);
            window.removeEventListener('mouseup', this.handleChange);
            window.removeEventListener('mouseup', this.handleMouseUp);
        },
        handleChange(e, skip) {
            //handles changes to the color pad
            !skip && e.preventDefault();
            var colorContainer = this.$refs.padContainer;
            var cWidth = colorContainer.clientWidth;
            var cHeight = colorContainer.clientHeight;

            var xOffset = colorContainer.getBoundingClientRect().left + window.pageXOffset;
            var yOffset = colorContainer.getBoundingClientRect().top + window.pageYOffset;

            var pageX = e.pageX || (e.touches ? e.touches[0].pageX : 0);
            var pageY = e.pageY || (e.touches ? e.touches[0].pageY : 0);

            var left = clamp(pageX - xOffset, 0, cWidth);
            var top = clamp(pageY - yOffset, 0, cHeight);
            var saturation = left / cWidth;
            var val = clamp(-(top / cHeight) + 1, 0, 1);
            this.s = Math.round(saturation * 100);
            this.v = Math.round(val * 100);
            this.throttle(this.updateColor);
        },
    },
};
</script>

<style lang="scss" scoped>
@import './ColorPickerHueSlider.css';
$width: 100%;
$height: 200px;
.custom-color-picker {
    padding: 1em;
    padding-bottom: 0.5em;
    height: $height;
    margin-left: 8px;
    background: #1c1c1c;
    display: grid;
    grid-template-columns: auto 30px;
    grid-template-rows: auto 50px;
    border-radius: 1em;
    overflow: hidden;
    box-sizing: border-box;
}

.color-pad {
    background: #c02d0c;
    position: relative;
    .gradient {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
    .g-black {
        background: linear-gradient(0deg, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 100%);
    }
    .g-white {
        background: linear-gradient(90deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%);
    }
    .thumb {
        position: absolute;
        margin-bottom: -0.5em;
        margin-left: -0.5em;
        bottom: 5%;
        left: 5%;
        width: 1em;
        height: 1em;
        border: #aaa 2px solid;
        border-radius: 50%;
        box-shadow: 0 0 3px #1c1c1c77;
    }
}
.buttons {
    display: flex;
    justify-content: space-between;
    width: 100%;
    grid-row: 2;
    grid-column: 1 / span 2;
    align-self: center;
    input {
        border-radius: 5px;
        padding: 0px 10px;
        width: auto;
        font-size: 12px;
        height: 30px;
        margin: 4px;
    }
}
.modal-button {
    font-size: 12px;
    height: 30px;
    padding: 0px 0px;
}

/* component style */
.vue-slider-disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* rail style */
.vue-slider-rail {
    background: linear-gradient(to bottom, red 0%, #ff0 17%, lime 33%, cyan 50%, blue 66%, #f0f 83%, red 100%);
    width: 16px;
    border-radius: 4px;
}

/* process style */
.vue-slider-process {
    background-color: #3498db;
    border-radius: 15px;
}

/* mark style */
.vue-slider-mark {
    z-index: 4;
}
.vue-slider-mark:first-child .vue-slider-mark-step,
.vue-slider-mark:last-child .vue-slider-mark-step {
    display: none;
}
.vue-slider-mark-step {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.16);
}
.vue-slider-mark-label {
    font-size: 14px;
    white-space: nowrap;
}
/* dot style */
.vue-slider-dot-handle {
    margin-top: 4px;
    cursor: pointer;
    width: 100%;
    height: 6px;
    border-radius: 1px;
    background-color: #fff;
    box-sizing: border-box;
    box-shadow: 0.5px 0.5px 2px 1px rgba(0, 0, 0, 0.32);
}
.vue-slider-dot-handle-focus {
    box-shadow: 0px 0px 1px 2px rgba(52, 152, 219, 0.36);
}

.vue-slider-dot-handle-disabled {
    cursor: not-allowed;
    background-color: #ccc;
}
</style>
