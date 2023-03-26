<template>
    <div class="die" :class="{ 'crit-fail': isCritFail, 'crit-success': isCritSuccess, unused: isUnused }">
        <div class="result">
            <img :src="dieImg" />
            <div class="die">{{ roll.value }}</div>
        </div>
    </div>
</template>

<script>
import getDieImage from './getDieImage.js';
export default {
    props: {
        roll: {
            type: Object,
            required: true,
        },
    },
    computed: {
        dieImg() {
            return getDieImage(this.roll.die);
        },
        isCritFail() {
            return this.roll.value == 1 && this.roll.die != 1;
        },
        isCritSuccess() {
            return this.roll.die == this.roll.value;
        },
        isUnused() {
            return false;
        },
    },
};
</script>

<style lang="scss" scoped>
.die {
    display: inline-block;
    text-align: center;
    padding: 0.5em;
    .result {
        position: relative;
        height: 2em;
        box-sizing: content-box;
        img {
            height: 100%;
            opacity: 0.25;
        }
        div {
            position: absolute;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            top: 0px;
            left: 0px;
            text-shadow: 0 0 5px #000;
            font-size: 1em;
            font-weight: bold;
        }
    }

    &.crit-success {
        .result {
            div {
                color: #33de5e;
            }
        }
    }
    &.crit-fail {
        .result {
            div {
                color: #f14c27;
            }
        }
    }
    &.unused {
        opacity: 0.25;
    }
}
</style>
