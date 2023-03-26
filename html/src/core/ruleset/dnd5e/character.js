import Vue from 'vue';

const abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
const skills = [
    'str(athletics)',
    'dex(acrobatics)',
    'dex(slight_of_hand)',
    'dex(stealth)',
    'int(arcana)',
    'int(history)',
    'int(investigation)',
    'int(nature)',
    'int(religion)',
    'wis(animal_handling)',
    'wis(insight)',
    'wis(medicine)',
    'wis(perception)',
    'wis(survival)',
    'cha(deception)',
    'cha(intimidate)',
    'cha(performance)',
    'cha(persuasion)',
];
// eslint-disable-next-line no-unused-vars
const conditions = [
    'blinded',
    'charmed',
    'deafened',
    'frightended',
    'grappled',
    'incapacitated',
    'invisible',
    'paralzyed',
    'petrified',
    'poisoned',
    'prone',
    'restrained',
    'stunned',
    'unconscious',
];

const createTemplate = function() {
    const template = {
        abilities: {
            str: 1,
            dex: 1,
            con: 1,
            int: 1,
            wis: 1,
            cha: 1,
        },
        class: {},
        proficiencies: {},
        hp: 10,
        hpMax: 10,
        items: [],
        effects: [],
    };

    return template;
};

const createChartTemplate = function() {
    const template = {
        'effects[]': [],
        level: 1,
        ac: 0,
        proficiency_bonus: 0,
    };

    // Add abiliity-based stats
    for (const ability of abilities) {
        template[`ability_score.${ability}`] = 1;
        template[`ability.${ability}`] = 0;
        template[`saving_throw.${ability}`] = 0;
    }

    // Skill modifiers
    for (const skill of skills) {
        template[`skill.${skill}`] = 0;
    }

    return template;
};

const PlayerCharacter = Vue.extend({
    data() {
        return {
            $_chart: createChartTemplate(),
            ...createTemplate(),
        };
    },
    computed: {
        activeEffects() {
            return this.chart['effects[]']
                .filter(effect => effect.active)
                .concat(this.effects.filter(effect => effect.active));
        },
        chart() {
            return this.$data.$_chart;
        },
    },
    created() {
        this.$_trackedEffects = {};
        this.configureWatchers();
    },
    methods: {
        configureWatchers() {
            this.addEffectsWatcher();

            for (const ability of abilities) {
                // Calculated ability score
                this.setupChartScore(`ability_score.${ability}`, {
                    base() {
                        return this.abilities[ability];
                    },
                    immediate: true,
                });

                // Ability modifier
                this.setupChartScore(`ability.${ability}`, {
                    base(chart) {
                        return Math.floor((chart[`ability_score.${ability}`] - 10) / 2);
                    },
                    immediate: true,
                });

                // Saving throws
                this.addProficiencyBasedScore(`saving_throw.${ability}`, ability);
            }

            // Skill proficiency modifiers
            for (const skill of skills) {
                const ability = skill.substr(0, 3);
                this.addProficiencyBasedScore(`skill.${skill}`, ability);
            }

            this.$watch(
                function() {
                    return this.class;
                },
                function(classes) {
                    this.chart.level = Object.values(classes).reduce((sum, n) => sum + n, 0);
                },
                { immediate: true, deep: true },
            );

            this.$watch(
                function() {
                    return this.chart.level;
                },
                function(level) {
                    this.chart['proficiency_bonus'] = Math.ceil(level / 4) + 1;
                },
                { immediate: true },
            );
        },
        addEffectsWatcher() {
            this.$watch(
                function() {
                    return this.activeEffects;
                },
                function(effects) {
                    const chart = this.chart;
                    const tracked = this.$_trackedEffects;

                    // Reset tracked effect count
                    for (const target in tracked) {
                        tracked[target] = 0;
                    }

                    for (const effect of effects) {
                        const modifiers = effect.modifiers;
                        if (!modifiers) {
                            continue;
                        }

                        // If new modifiers don't match what's already in the chart,
                        // update the chart and corresponding tracking information.
                        for (const target in modifiers) {
                            const key = `${target}[]`;
                            if (!(key in chart)) {
                                this.$set(chart, key, []);
                                tracked[key] = 0;
                            }

                            const chartedEffects = chart[key];
                            const matchedCount = tracked[key];

                            if (chartedEffects[matchedCount] === effect) {
                                tracked[key]++;
                            } else {
                                chartedEffects.splice(matchedCount, chartedEffects.length, effect);
                                tracked[key] = chartedEffects.length;
                            }
                        }
                    }

                    // Remove effects that are no longer active
                    for (const [key, newCount] of Object.entries(tracked)) {
                        if (newCount > 0) {
                            continue;
                        }
                        const chartedEffects = chart[key];
                        chartedEffects.splice(0, chartedEffects.length);
                    }
                },
            );
        },
        /**
         *
         * @param {string} key - Key for the chart entry to be updated
         * @param {Object} options
         * @param {any} options.base - Base value to apply effects to, or function to generate it
         * @param {any} [options.context] - A context object, or function to generate it
         * @param {boolean} [options.immediate] - Chart entry should be updated immediately
         */
        setupChartScore(key, { base, context, immediate }) {
            this.$watch(
                function() {
                    const contextValue = typeof context === 'function' ? context.call(this, this.chart) : context;
                    return {
                        base: typeof base === 'function' ? base.call(this, this.chart, contextValue) : base,
                        context: contextValue,
                        effects: this.chart[`${key}[]`],
                    };
                },
                function({ base, effects, context }) {
                    if (!effects) {
                        this.chart[key] = base;
                        return;
                    }

                    const mods = effects.map(effect => effect.modifiers[key]);

                    const result = mods.reduce(
                        ((prev, cur) => {
                            if (typeof cur !== 'object') {
                                return cur;
                            }
                            if (cur['+']) {
                                return prev + cur['+'];
                            }
                            if (cur['=']) {
                                return cur['='];
                            }
                            if (cur['=(max)']) {
                                return Math.max(prev, cur['=(max)']);
                            }
                            if (cur['*']) {
                                return prev * cur['*'];
                            }

                            if (process.env.NODE_ENV !== 'production') {
                                console.warn('unknown modifier op: %o', cur);
                            }

                            return prev;
                        }).bind(context),
                        base,
                    );

                    this.chart[key] = result;
                },
                { immediate },
            );
        },
        addProficiencyBasedScore(proficiency, ability) {
            this.setupChartScore(proficiency, {
                context(chart) {
                    return {
                        proficiency: this.proficiencies[proficiency],
                        ability: ability,
                        abilityBonus: chart[`ability.${ability}`],
                        bonus: chart['proficiency_bonus'],
                    };
                },
                base(chart, context) {
                    let multiplier = context.proficiency;
                    multiplier = Number.parseInt(multiplier) || multiplier || 0;
                    return context.abilityBonus + multiplier * context.bonus;
                },
            });
        },
    },
});

export { PlayerCharacter, skills, abilities };
