<template>
    <div class="character-library">
        <CharacterList v-bind:characters="characters" />
    </div>
</template>

<script lang="ts">
import { mapActions, mapGetters, mapState } from 'vuex';

import CharacterList from './CharacterList.vue';
export default {
    components: {
        CharacterList: CharacterList,
    },
    computed: {
        ...mapGetters('gamestate/', {
            selectedTokenId: 'selectedTokenId',
        }),
        ...mapState('live', {
            director: 'director',
            connected: 'connected',
        }),
        ...mapGetters('characters', {
            characters: 'getCharacters',
        }),
    },
    watch: {
        connected: async function() {
            if (this.connected) {
                await this.loadCharacterFiles();
                await this.loadCharacters();
            }
        },
    },
    methods: {
        ...mapActions('characters', {
            addCharacter: 'add',
            loadCharacters: 'load',
        }),
        ...mapActions('library', {
            loadCharacterFiles: 'getCharacters',
        }),
    },
};
</script>
<style scoped>
.character-library {
    height: 100%;
    overflow-y: auto;
    padding-top: 1em;
}
</style>
