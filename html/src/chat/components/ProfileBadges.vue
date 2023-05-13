<template>
    <span class="icons">
        <fa-icon
            v-for="group in validGroups(getGroups(userId))"
            :key="group"
            :icon="getIcon(group)"
            :class="[group.replace(' ', '_').replace('/', ''), 'icon']"
            :title="group.replace('/', '')"
        />
    </span>
</template>

<script lang="ts">
import { mapGetters } from 'vuex';

export default {
    props: {
        userId: {
            type: String,
            required: true,
        },
    },
    computed: {
        ...mapGetters('profile', {
            getGroups: 'getGroups',
        }),
    },
    methods: {
        getIcon(groupName) {
            switch (groupName) {
                case '/Bronze Kickstarter':
                case '/Silver Kickstarter':
                case '/Gold Kickstarter':
                case '/Platinum Kickstarter':
                    return ['fab', 'kickstarter-k'];
                case 'MythicTable Contributor':
                    return ['fas', 'dice-d20'];
            }
            return null;
        },
        validGroups(groups) {
            console.log(groups);
            if (!groups) {
                return [];
            }
            return groups.filter(group => this.getIcon(group) != null);
        },
    },
};
</script>

<style lang="scss" scoped>
.icon {
    margin-left: 5px;
}
.Bronze_Kickstarter,
.Silver_Kickstarter,
.Gold_Kickstarter,
.Platinum_Kickstarter {
    color: green;
}

.MythicTable_Contributor {
    color: lightskyblue;
}
</style>
