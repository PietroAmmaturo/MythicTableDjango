<template>
    <div class="DiceRoll" :class="{ 'result-hidden': !showResult }">
        <div class="result" v-if="showResult">{{ result }}</div>
        <div class="rolls">
            <div class="formula">{{ formula }}</div>
            <Die v-for="roll in diceArray" :key="roll.index" :roll="roll.roll" />
        </div>
    </div>
</template>
<script>
import Die from './DieResult.vue';
export default {
    components: {
        Die,
    },
    props: {
        dice: {
            type: Object,
            required: true,
        },
        showResult: {
            type: Boolean,
            default: true,
        },
    },

    computed: {
        result() {
            return this.dice.result;
        },
        formula() {
            return this.dice.formula;
        },
        diceArray() {
            //add an index to each dice to allow for animated sorting
            return this.dice.rolls.map((roll, index) => {
                return {
                    roll,
                    index,
                };
            });
        },
    },
};
</script>

<style lang="scss" scoped>
.DiceRoll {
    display: grid;
    grid-template-columns: 25% 100fr;
    grid-template-rows: 100%;
    max-height: 7em;
    overflow: hidden;
    background: #242424;
    position: relative;
    border-radius: 1em;
    color: #fff;
    .result {
        align-self: center;
        justify-self: center;
        padding: 1em 2ch;
        font-size: 2em;
    }
    &.result-hidden {
        width: 20ch;
        .rolls {
            grid-column: 1 / span 2;
            .formula {
                display: none;
            }
        }
    }
    .rolls {
        padding: 0.5em 0em;
        height: 100%;
        overflow-y: auto;
        background: #1c1c1c;
        grid-column: 2;
        .formula {
            padding-left: 1ch;
            padding-bottom: 0.25em;
            color: #8b8b8b;
            width: 100%;
            border-bottom: 1px #2e2e2e solid;
            font-weight: normal;
        }
    }
}
</style>
