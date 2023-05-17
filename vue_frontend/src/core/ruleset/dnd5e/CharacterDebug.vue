<template>
    <div>
        <h1>DnD 5e</h1>
        <div class="container">
            <div>
                <h2>Fundamentals</h2>
                <div>
                    Level ({{ chart['level'] }}):
                    <ul>
                        <li v-for="(lvl, cls) in character.class" :key="cls">
                            {{ cls }}: <input v-model.number="character.class[cls]" type="number" min="0" max="20" />
                        </li>
                    </ul>
                </div>
                <div v-for="ability in allAbilities" :key="ability">
                    <label>
                        {{ ability.toUpperCase() }}
                        <input v-model.number="character.abilities[ability]" type="number" min="0" max="20" />
                    </label>
                    <b> {{ chart[`ability_score.${ability}`] }} </b> ({{ chart[`ability.${ability}`] | asModifier }})
                </div>
                <hr />
                <div>Proficiency bonus: {{ chart['proficiency_bonus'] | asModifier }}</div>

                <hr />

                <h3>Saving Throws</h3>
                <table>
                    <tr v-for="ability in allAbilities" :key="`saving_throw.${ability}`">
                        <td><input v-model="character.proficiencies[`saving_throw.${ability}`]" type="checkbox" /></td>
                        <td>{{ ability.toUpperCase() }}</td>
                        <td class="modifier">{{ chart[`saving_throw.${ability}`] | asModifier }}</td>
                    </tr>
                </table>
            </div>
            <div>
                <h2>Skills</h2>
                <table>
                    <tr v-for="skill in allSkills" :key="skill">
                        <td>
                            <input v-model="character.proficiencies[`skill.${skill}`]" type="checkbox" />
                            <input
                                v-model.number="character.proficiencies[`skill.${skill}`]"
                                :disabled="!character.proficiencies[`skill.${skill}`]"
                                type="checkbox"
                                true-value="2"
                                false-value="1"
                            />
                        </td>
                        <td class="modifier">{{ chart[`skill.${skill}`] | asModifier }}</td>
                        <td>{{ skill }}</td>
                    </tr>
                </table>
            </div>

            <div>
                <h2>Effects</h2>
                <div v-for="(effect, index) in character.effects" :key="index">
                    <input v-model="effect.active" type="checkbox" /> {{ effect.id }}
                </div>
            </div>
        </div>
        <hr />
        <div class="container">
            <div>
                <h2>Raw character info</h2>
                <pre>{{ JSON.stringify(character.$data, (k, v) => (k.startsWith('$_') ? undefined : v), 2) }}</pre>
            </div>

            <div>
                <h2>Raw chart</h2>
                <pre>{{ JSON.stringify(character.chart, null, 2) }}</pre>
            </div>
        </div>
    </div>
</template>

<script>
import Vue from 'vue';

import { PlayerCharacter, skills as allSkills, abilities as allAbilities } from './character';

let testCharacter = {
    class: {
        bard: 3,
        wizard: 1,
    },
    abilities: {
        str: 3,
        dex: 12,
        con: 8,
        int: 5,
        wis: 10,
        cha: 16,
    },
    proficiencies: {
        'saving_throw.int': true,
        'saving_throw.wis': true,
        'skill.dex(acrobatics)': true,
        'skill.dex(slight_of_hand)': true,
        'skill.cha(performance)': 2,
        'skill.cha(persuasion)': true,
    },
    effects: [
        {
            id: 'item:belt_of_giant_strength(hill)',
            modifiers: Object.freeze({ 'ability_score.str': { '=(max)': 21 } }),
            active: false,
        },
        {
            id: 'item:amulet_of_health',
            modifiers: Object.freeze({ 'ability_score.con': { '=(max)': 19 } }),
            active: false,
        },
        {
            id: 'item:ring_of_protection',
            modifiers: Object.freeze({
                armor_class: { '+': 1 },
                'saving_throw.str': { '+': 1 },
                'saving_throw.dex': { '+': 1 },
                'saving_throw.con': { '+': 1 },
                'saving_throw.int': { '+': 1 },
                'saving_throw.wis': { '+': 1 },
                'saving_throw.cha': { '+': 1 },
            }),
            active: false,
        },
    ],
};

export default {
    data() {
        return {
            character: new PlayerCharacter({
                data() {
                    return testCharacter;
                },
            }),
        };
    },
    computed: {
        chart() {
            return this.character.chart;
        },
        allAbilities() {
            return allAbilities;
        },
        allSkills() {
            return allSkills;
        },
    },
};

Vue.filter('asModifier', value => (value > 0 ? '+' + value : value.toString()));
</script>

<style scoped>
div ul {
    list-style-type: none;
}

.container {
    display: flex;
    flex-flow: row wrap;
}

.container > div {
    margin: 0 0.5rem;
    padding: 0.5rem 1rem;
    border: 1px solid darkgrey;
    font-family: monospace;
}

.modifier {
    background-color: #f4f4f4;
    text-align: right;
}

td.modifier {
    width: 4ex;
    padding: 0 0.5ex;
}
</style>
