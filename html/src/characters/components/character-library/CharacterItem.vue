<template>
    <div :id="character._id" :title="character.name" @dblclick="onDblClick">
        <CharacterToken
            :image="character.image"
            :mode="character.borderMode"
            :color="character.borderColor"
            :icon="character.icon"
            :privacy="character.private"
            :scale="0.5"
            size="65px"
        />
    </div>
</template>

<style scoped>
img {
    width: 50px;
    height: 50px;
}
</style>

<script>
import CharacterToken from '../CharacterToken.vue';
import { mapActions } from 'vuex';
import Character from '@/characters/models/model';

export default {
    components: {
        CharacterToken: CharacterToken,
    },
    props: {
        character: {
            type: Object,
            default: function() {
                return new Character(null);
            },
        },
    },
    methods: {
        ...mapActions('characters', {
            openCharacterEditor: 'openEditor',
        }),
        onDblClick: function() {
            this.openCharacterEditor(this.character);
        },
    },
};
</script>

<style scoped>
.character-item {
    flex-grow: 1;
    display: flex;
    align-items: center;
    flex-direction: column;
    margin: 2px;
    padding: 15px;
    background: #1c1c1c;
    max-width: 150px;
    transition: background 0.7s ease;
    user-select: none;
    cursor: pointer;
}
.character-item:hover {
    background: #1c1c1c71;
    transition: background 0s ease;
}
.character-item div {
    padding-top: 10px;
    font-weight: bold;
    display: none;
}
</style>
