<template>
    <div class="container">
        <img
            v-if="randomDie"
            class="icon"
            :src="`/static/icons/dice/SVG/${randomDie}.svg`"
            :alt="`Minimized macro bar, represented by a ${randomDie} icon.`"
            @click="showMacros"
        />
        <slot v-if="showSlot" />
    </div>
</template>

<script>
export default {
    props: {
        showSlot: {
            type: Boolean,
            required: true,
        },
    },
    data() {
        return {
            randomDie: '',
            diceOptions: ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'],
        };
    },
    created() {
        let index = Math.floor(this.diceOptions.length * Math.random());
        this.randomDie = this.diceOptions[index];
    },
    methods: {
        showMacros() {
            this.$emit('toggle-macro-bar');
        },
    },
};
</script>

<style lang="scss" scoped>
$padding: 20px;
$offset: 5px;
$mini-icon-size: 25px;

.icon {
    width: 30px;
    margin: 0 0 (-1 * $padding / 2) + $offset (-1 * $padding / 2) + $offset;
    padding: $padding;
    background-color: #31313a;
    border-radius: 0 50% 0 0;
    cursor: pointer;
}
.container {
    position: fixed;
    bottom: 0;
    left: 0;
    box-sizing: content-box;
    width: fit-content;
    padding: 0;
}
.macro-options {
    position: absolute;
    left: 1rem;
    bottom: calc(100% + 15px);
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0;
    padding: 0;
    width: $mini-icon-size * 6 + ($mini-icon-size * 0.3) * 12 + 5 * 3;
    background-color: #1c1c1c;
    border: 3px solid #1c1c1c;
    border-radius: 8px;
    button {
        margin: 8px 2.5% 5px 2.5%;
    }
    div {
        position: absolute;
        left: 0;
        top: 100%;
        width: 18px;
        height: 16px;
        box-sizing: border-box;
        margin: 3px 0 0 3px;
        border: 8px solid;
        border-color: #1c1c1cea transparent transparent transparent;
    }
}
.standard-dice-macros {
    padding: 0 0 0 0;
    margin: 0 0 3px 0;
    display: flex;
    flex-direction: row;
    list-style: none;
    img {
        height: $mini-icon-size;
        width: $mini-icon-size;
        padding: $mini-icon-size * 0.3 $mini-icon-size * 0.3;
        border-right: #333 solid 3px;
        box-sizing: content-box;
        &:first-child {
            border-radius: 8px 0 0 0;
        }
        &:last-child {
            border-radius: 0 8px 0 0;
            border: none;
        }
        &:hover {
            background: #333;
        }
    }
}
.macro-list {
    box-sizing: border-box;
    padding: 5px 0 0 5%;
    margin: 0;
    width: 100%;
    max-height: 150px;
    overflow-y: auto;
    background-color: #31313a;
    border-radius: 0 0 8px 8px;
    li.macro {
        padding: 5px;
        margin: 0 0 5px 0;
        border-radius: 6px;
        grid-template-columns: auto;
        &:hover {
            border: 0.5px solid white;
        }
    }
}
</style>
