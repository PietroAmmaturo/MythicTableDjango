<template>
    <v-popover :offset="3" placement="left">
        <div
            class="inline-dice-roll tooltip-target"
            :class="{ 'has-dice': hasDice(), 'crit-success': isMax(), 'crit-fail': isMin() }"
        >
            <img class="dice-image" v-if="hasDice()" :src="getDieImg()" />
            {{ getFormula() }}
        </div>
        <template slot="popover">
            <DiceRoll :dice="element.results" :showResult="false" />
        </template>
    </v-popover>
</template>

<script>
import GetDieImage from './getDieImage.js';
import DiceRoll from './DiceRoll.vue';
export default {
    components: {
        DiceRoll,
    },
    props: {
        element: {
            type: Object,
            required: true,
        },
    },
    methods: {
        getFormula() {
            return `${this.element.results.formula} = ${this.element.results.result}`;
        },
        getDieImg() {
            if (!this.hasDice()) return;
            return GetDieImage(this.element.results.rolls[0].die, 'png50');
        },
        hasDice() {
            return this.element.results.rolls.length > 0;
        },
        isMax() {
            if (!this.hasDice()) return false;
            let calculateCount = (acc, val) => (acc += val ? 1 : 0);
            let maxCount = this.element.results.rolls.map(roll => roll.die == roll.value).reduce(calculateCount, 0);
            return maxCount == this.element.results.rolls.length;
        },
        isMin() {
            if (!this.hasDice()) return false;
            let calculateCount = (acc, val) => (acc += val ? 1 : 0);
            let minCount = this.element.results.rolls
                .map(roll => roll.value == 1 && roll.value != roll.die)
                .reduce(calculateCount, 0);
            return minCount == this.element.results.rolls.length;
        },
    },
};
</script>

<style lang="scss">
.inline-dice-roll {
    background: #444444;
    border: 3px #1b1b1b;
    padding: 2px 1ch;
    margin: 2px 0;
    border-radius: 3px;
    display: inline-block;
    &.has-dice {
        border-radius: 1em;
    }
    &.crit-success {
        background: #1ba73e;
    }
    &.crit-fail {
        background: #c02d0c;
    }
    img {
        height: 1.1em;
        margin-top: -2px;
        padding-right: 0.5ch;
    }
}
.tooltip {
    &.popover {
        background: none;
        border: none;
        .popover-inner {
            padding: 0;
            border-radius: 0;
            background: #00000000;
            border-radius: 1em;
            box-shadow: 0 0 15px #000;
        }
        .popover-arrow {
            border-color: #4d4d4d;
        }
    }
}
.v-popover {
    display: inline-block;
    cursor: pointer;
}
</style>
