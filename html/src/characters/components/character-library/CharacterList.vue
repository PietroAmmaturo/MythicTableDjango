<template>
    <div class="character-list">
        <div @dragstart="dragStart" @drop="drop">
            <draggable :list="characters" class="dragArea list-group">
                <CharacterItem
                    v-for="character in publicCharacters"
                    v-bind:key="character._id"
                    v-bind:character="character"
                />
            </draggable>
        </div>
    </div>
</template>

<script lang="ts">
import draggable from 'vuedraggable';
import CharacterItem from './CharacterItem.vue';
import { mapState } from 'vuex';

export default {
    name: 'CharacterList',
    components: {
        CharacterItem: CharacterItem,
        draggable: draggable,
    },
    props: {
        characters: {
            type: Array,
            default: function() {
                return [];
            },
        },
    },
    computed: {
        ...mapState('profile', {
            me: 'me',
        }),
        publicCharacters: {
            get() {
                return Object.values(this.characters).filter(
                    character => !character['private'] || character['_userid'] == this.me.id,
                );
            },
        },
    },
    methods: {
        dragStart: function(evt) {
            const id = evt.target.id;
            const character = this.$props.characters.find(c => c._id == id);
            this.$store.dispatch('dropper/startDrag', character);
        },
        drop: function() {
            this.$store.dispatch('dropper/reset');
        },
    },
};
</script>
<style scoped>
.character-list {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
}
.list-group {
    flex-direction: row;
    flex-wrap: wrap;
}
</style>
