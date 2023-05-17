<template>
    <div class="icon-selector">
        <input type="text" class="search" v-model="search" placeholder="Search" @input="updateIconList" />
        <button class="modal-button accent-red-large" @click="clearIcon">Clear</button>
        <div class="icon-container">
            <div
                class="icon"
                v-for="icon in icons"
                :key="icon.name"
                @click="setCurrentIcon(icon.unicode)"
                :class="getSelected(icon.unicode)"
            >
                {{ icon.unicode }}
            </div>
        </div>
    </div>
</template>

<script>
import icons from './icons.json';

export default {
    props: {
        value: {
            type: String,
            default: null,
        },
    },
    data() {
        return {
            icons: [],
            search: '',
        };
    },
    computed: {
        currentIcon: {
            get() {
                return this.value;
            },
            set(newValue) {
                this.$emit('input', newValue);
                this.updateIconList();
            },
        },
    },
    mounted() {
        this.updateIconList();
    },
    methods: {
        async updateIconList() {
            const result = await this.$search(this.search, icons, {
                findAllMatches: false,
                threshold: 0.4,
                keys: ['name', 'category'],
            });
            const current = icons.find(icon => icon.unicode == this.currentIcon);
            if (result.length == 0) {
                this.icons = icons.slice(0, 10);
                if (current && this.icons.findIndex(el => el.unicode == this.currentIcon) == -1) {
                    this.icons.unshift(current);
                    this.icons.pop();
                }
            } else {
                if (result.findIndex(el => el.unicode == this.currentIcon) == -1 && current) {
                    result.unshift(current);
                }
                this.icons = result;
            }
        },
        clearIcon() {
            this.currentIcon = '';
        },
        getSelected(unicode) {
            return unicode == this.currentIcon ? 'selected' : '';
        },
        setCurrentIcon(unicode) {
            this.currentIcon = unicode;
        },
    },
};
</script>

<style lang="scss" scoped>
.icon-selector {
    display: grid;
    grid-template-columns: auto 20%;
    grid-template-rows: auto auto;
}
button {
    width: 100% !important;
    height: 100%;
    margin: 0 !important;
    border-radius: 0 0.5em 0.5em 0;
}
input {
    border-radius: 0.5em 0 0 0.5em;
}
.icon-container {
    grid-row: 1;
    grid-column: 1 / span 2;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    margin-bottom: 1em;
    max-height: 7em;
    overflow-y: auto;
    .icon {
        padding: 5px;
        margin: 3px;
        border-radius: 4px;
        background: #1c1c1c;
        cursor: pointer;
        user-select: none;
        max-width: 1.3em;
        text-align: center;
        flex-grow: 1;
        &.selected {
            background: #fff;
            color: #1c1c1c;
        }
    }
}
.search {
    width: 100%;
}

.icon {
    font-family: 'RPGAwesome';
    font-size: 2em;
    line-height: 1em;
}
</style>
