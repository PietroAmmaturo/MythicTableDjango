<template>
    <div class="map-list">
        <MapItem
            v-for="map in publicMaps"
            :key="String(map._id + map.private + map.name)"
            :map="map"
            :selected="map === selected"
            :v-show="!map.private"
            @onEdit="onEdit"
            @onSelect="onSelect"
            @onMoveAll="onMoveAll"
        />
    </div>
</template>

<script lang="ts">
import MapItem from './MapItem.vue';
import { mapState, mapMutations } from 'vuex';

export default {
    name: 'MapList',
    display: 'Maps',
    components: {
        MapItem: MapItem,
    },
    props: {
        maps: {
            type: Object,
            default: function() {
                return {};
            },
        },
        activeMap: {
            type: Object,
            default: () => null,
        },
    },
    data: function() {
        return {
            selected: null,
        };
    },
    computed: {
        ...mapState('profile', {
            me: 'me',
        }),
        publicMaps: {
            get() {
                return Object.values(this.maps).filter(map => !map['private'] || map['_userid'] == this.me.id);
            },
        },
    },
    watch: {
        activeMap: function() {
            this.selected = this.activeMap;
        },
    },
    methods: {
        ...mapMutations('editingModes', {
            setEditMap: 'setEditMap',
        }),
        onEdit: function({ map }) {
            this.$emit('onEdit', { map });
        },
        onSelect: function({ map }) {
            this.$store.dispatch('analytics/pushEvent', {
                event: { category: 'CampaignMap', action: 'SwitchMap', name: 'self', value: map._id },
            });
            this.setEditMap(false);
            this.$emit('onSelected', { map });
        },
        onMoveAll: function({ map }) {
            this.$store.dispatch('analytics/pushEvent', {
                event: { category: 'CampaignMap', action: 'SwitchMap', name: 'all', value: map._id },
            });
            this.$emit('onMoveAll', { map });
        },
    },
};
</script>
<style scoped>
.map-list {
    padding: 0 1em;
    overflow: auto;
    flex: 1;
}
</style>
