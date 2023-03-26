<template>
    <div v-bind:class="getModeClass()" @click="onClicked">
        <div class="iconOverlay" :style="iconStyle()" v-if="icon">{{ icon }}</div>
        <div class="privacyOverlay" v-if="privacy"><img src="/static/icons/layout/invisible.svg" /></div>
        <div class="circleClass_outer" v-bind:style="getOuterStyle()">
            <div class="circleClass" v-bind:style="getMiddleStyle()">
                <div class="circleClass_inner" v-bind:style="getInnerStyle()">
                    <div class="upload-overlay" :class="{ 'new-image': !image }" v-if="editor">
                        <img src="/static/icons/layout/upload.svg" /> <span v-if="image">Upload New Token</span
                        ><span v-else>Upload Token</span>
                    </div>
                    <div
                        v-if="image"
                        class="img"
                        v-bind:style="{ backgroundImage: 'url(' + image + ')', width: size, height: size }"
                    />
                    <div v-if="!image">
                        <svg
                            v-bind:style="{ width: size, height: size, padding: '20%' }"
                            class="download"
                            version="1.1"
                            id="Capa_1"
                            xmlns="http://www.w3.org/2000/svg"
                            xmlns:xlink="http://www.w3.org/1999/xlink"
                            x="0px"
                            y="0px"
                            viewBox="0 0 477.827 477.827"
                            xml:space="preserve"
                        >
                            <path
                                d="M441.537,160.632c1.489-7.981,2.243-16.082,2.253-24.201C443.699,61.026,382.498-0.028,307.093,0.062
                            c-57.402,0.069-108.63,36.034-128.194,89.999c-35.029-13.944-74.73,3.148-88.675,38.177c-1.207,3.032-2.195,6.146-2.956,9.319
                            c-55.932,8.365-94.492,60.488-86.127,116.42c7.502,50.163,50.596,87.275,101.316,87.254h85.333
                            c9.426,0,17.067-7.641,17.067-17.067c0-9.426-7.641-17.067-17.067-17.067h-85.333c-37.703,0-68.267-30.564-68.267-68.267
                            s30.564-68.267,68.267-68.267c9.426,0,17.067-7.641,17.067-17.067c0.031-18.851,15.338-34.108,34.189-34.077
                            c8.915,0.015,17.471,3.517,23.837,9.757c6.713,6.616,17.519,6.537,24.135-0.176c2.484-2.521,4.123-5.751,4.69-9.245
                            c9.264-55.733,61.954-93.403,117.687-84.139c55.733,9.264,93.403,61.954,84.139,117.687c-0.552,3.323-1.269,6.617-2.146,9.869
                            c-1.962,7.124,0.883,14.701,7.049,18.773c31.416,20.845,39.985,63.212,19.139,94.628c-12.617,19.015-33.9,30.468-56.72,30.522
                            h-51.2c-9.426,0-17.067,7.641-17.067,17.067c0,9.426,7.641,17.067,17.067,17.067h51.2
                            c56.554-0.053,102.357-45.943,102.303-102.497C477.798,208.632,464.526,180.066,441.537,160.632z"
                            />
                            <path
                                d="M353.456,243.832l-85.333-85.333c-1.589-1.593-3.481-2.852-5.564-3.703c-4.175-1.726-8.864-1.726-13.039,0
                            c-2.083,0.852-3.974,2.111-5.564,3.703l-85.333,85.333c-6.548,6.78-6.36,17.584,0.42,24.132c6.614,6.387,17.099,6.387,23.712,0
                            l56.235-56.201v248.934c0,9.426,7.641,17.067,17.067,17.067c9.426,0,17.067-7.641,17.067-17.067V211.764l56.201,56.201
                            c6.78,6.548,17.584,6.36,24.132-0.42C359.844,260.931,359.844,250.445,353.456,243.832z"
                            />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
.upload-overlay {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: absolute;
    width: 100%;
    height: 100%;
    background: #000000c7;
    top: 0px;
    right: 0px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.25s;
    z-index: 20;
    &.new-image {
        opacity: 1;
        border-radius: 50%;
    }
    img {
        position: relative;
        height: 2em;
        top: -10px;
    }
}
.circleToken {
    position: relative;
    &:hover {
        .circleClass_outer .circleClass .circleClass_inner .upload-overlay {
            opacity: 1;
        }
    }
    &.editor {
        cursor: pointer;
    }
}
.circleToken * {
    transition: border-radius 1s ease;
}
.circleToken.squareMode,
.circleToken.circleMode {
    /* account for the smaller tile sizes */
    margin-top: 0rem;
    margin-bottom: 0rem;
}
.circleClass_selection:focus,
.circleClass_selection.selected {
    border: 0.5rem solid #0a0;
}

.circleClass_selection:hover {
    border: 0.5rem solid rgba(#0a0, 0.3);
}

.circleToken.circleClass_selection {
    display: inline-block;
    border-radius: 50%;
    border: 0.5rem solid transparent;
}

.circleToken.tileMode .circleClass_outer {
    border-radius: 0;
}

.circleToken.circleMode .circleClass_outer {
    padding: 0;
    background: none !important;
}

.circleToken.squareMode .circleClass_outer {
    border-radius: 0;
    padding: 0;
    background: none !important;
}

.circleToken .circleClass_outer {
    padding: 0.25rem;
    border-radius: 50%;
    background: conic-gradient(#2d291f, #5f5643, #fff, #635a46, #2d291f);
}

.circleToken.tileMode .circleClass {
    border-radius: 0;
}

.circleToken.circleMode .circleClass {
    padding: 0;
    background: none !important;
}

.circleToken.squareMode .circleClass {
    border-radius: 0;
    padding: 0;
    background: none !important;
}

.circleToken .circleClass {
    padding: 0.5rem;
    border-radius: 50%;
    background: #a19271;
}

.circleToken.tileMode .circleClass_inner {
    border-radius: 0;
}

.circleToken.circleMode .circleClass_inner {
    padding: 0;
    background: none !important;
}

.circleToken.squareMode .circleClass_inner {
    border-radius: 0;
    padding: 0;
    background: none !important;
}

.circleToken .circleClass_inner {
    padding: 0.25rem;
    border-radius: 50%;
    background: conic-gradient(#fff, #635a46, #2d291f, #5f5643, #fff);
    position: relative;
    overflow: hidden;
}

.circleToken .circleClass_smallContainer .circleClass_outer {
    padding: 0.15rem;
}

.circleToken .circleClass_smallContainer .circleClass {
    padding: 0.15rem;
}

.circleToken .circleClass_smallContainer .circleClass_inner {
    padding: 0.15rem;
}

.circleToken.tileMode .circleClass .img {
    border-radius: 0;
}

.circleToken.squareMode .circleClass .img {
    border-radius: 0;
}

.circleToken.circleMode .circleClass .img,
.circleToken.squareMode .circleClass .img {
    background-color: #00000000;
}

.circleToken .circleClass .img {
    width: 5rem;
    height: 5rem;
    border-radius: 50%;
    overflow: hidden;
    background: #353b3a;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
}

.circleToken .circleClass_smallContainer {
    position: absolute;
    left: 0;
    top: 0rem;
    padding-left: calc(100% - 1.25rem);
    white-space: nowrap;
}

.circleToken .circleClass_element {
    display: inline-block;
}

.circleToken .circleClass .small {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    overflow: hidden;
    background: #353b3a;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    line-height: 3.5rem;
    font-size: 2rem;
    text-align: center;
    color: #fff;
}

.circleToken .privacyOverlay {
    width: 2em;
    height: 2em;
    position: absolute;
    bottom: 0;
    right: 0;
    z-index: 100;
    background: #df3c17;
    padding: 0px 4px;
    margin-right: -7px;
    margin-top: -9px;
    border-color: #c02d0c;
    border-radius: 50%;
    border-style: solid;
    border-width: 3px;
    box-sizing: border-box;
    transition: bottom 1s ease, right 1s ease;
    display: flex;
    align-items: center;
}
.circleToken.coinMode .privacyOverlay {
    bottom: 0.1rem;
    right: 0.1rem;
}
.circleToken.circleMode .privacyOverlay {
    bottom: 0.4rem;
    right: 0.4rem;
}
.circleToken.tileMode .privacyOverlay {
    bottom: -0.5rem;
    right: -0.2rem;
}
.circleToken.squareMode .privacyOverlay {
    bottom: -0.3rem;
    right: 0rem;
}

.circleToken .iconOverlay {
    font-family: 'RPGAwesome';
    font-size: 3em;
    line-height: 1em;
    position: absolute;
    top: 0;
    right: 0;
    z-index: 100;
    background: #1c1c1c;
    padding: 0.4em;
    margin-right: -7px;
    margin-top: -9px;
    border-radius: 50%;
    border-style: solid;
    border-width: 3px;
    box-sizing: border-box;
    transition: top 1s ease, right 1s ease;
}

.circleToken.coinMode .iconOverlay,
.circleToken.circleMode .iconOverlay {
    top: 0rem;
    right: 0rem;
}
.circleToken.tileMode .iconOverlay,
.circleToken.squareMode .iconOverlay {
    top: -0.5rem;
    right: -0.5rem;
}
</style>

<script lang="ts">
import LightenDarkenColor from '@/characters/utils/LightenDarkenColor.js';
import '@/common/assets/icons.css';
export default {
    props: {
        image: {
            default: '',
            type: String,
        },
        editor: {
            type: Boolean,
        },
        mode: {
            default: 'square',
            type: String,
        },
        color: {
            default: '#1c1c1c',
            type: String,
        },
        size: {
            default: '100px',
            type: String,
        },
        icon: {
            default: '',
            type: String,
        },
        scale: {
            default: 1,
            type: Number,
        },
        privacy: {
            type: Boolean,
        },
    },
    methods: {
        getModeClass() {
            return {
                circleMode: this.mode === 'circle',
                coinMode: this.mode === 'coin',
                tileMode: this.mode === 'tile',
                squareMode: this.mode === 'square' || this.mode === '',
                circleToken: true,
                circleClass_selection: true,
                editor: this.editor,
            };
        },
        iconStyle() {
            return {
                'border-color': this.color,
                'font-size': `${3 * this.scale}em`,
            };
        },
        getOuterStyle() {
            return {
                background:
                    'conic-gradient(' +
                    LightenDarkenColor(this.color, 0.4) +
                    ', ' +
                    LightenDarkenColor(this.color, -0.3) +
                    ', ' +
                    LightenDarkenColor(this.color, -0.2) +
                    ', ' +
                    LightenDarkenColor(this.color, -0.25) +
                    ', ' +
                    LightenDarkenColor(this.color, 0.4) +
                    ')',
                padding: `${0.25 * this.scale}em`,
            };
        },
        getMiddleStyle() {
            return {
                background: this.color,
                padding: `${0.5 * this.scale}em`,
            };
        },
        getInnerStyle() {
            return {
                background:
                    'conic-gradient(' +
                    LightenDarkenColor(this.color, -0.2) +
                    ', ' +
                    LightenDarkenColor(this.color, -0.2) +
                    ', ' +
                    LightenDarkenColor(this.color, 0.4) +
                    ', ' +
                    LightenDarkenColor(this.color, -0.3) +
                    ', ' +
                    LightenDarkenColor(this.color, -0.2) +
                    ')',
                padding: `${0.25 * this.scale}em`,
            };
        },
        onClicked(params) {
            this.$emit('click', params);
        },
    },
};
</script>
