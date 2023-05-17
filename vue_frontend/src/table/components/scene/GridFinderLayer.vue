<template>
    <v-group ref="gridfinder">
        <v-group v-if="active">
            <v-group v-for="circle in circles" :key="circle.id" @click="circleClicked">
                <v-line :config="verticalLineConfig(circle)" />
                <v-line :config="horizontalLineConfig(circle)" />
                <v-circle :config="config(circle)" />
            </v-group>
        </v-group>
    </v-group>
</template>

<script>
import { mapState } from 'vuex';

export default {
    props: {
        mapId: {
            type: String,
            required: true,
        },
    },
    data: function() {
        return {
            circles: [],
            lastId: 0,
        };
    },
    computed: {
        ...mapState('grid', {
            active: 'active',
        }),
    },
    watch: {
        active: function(isActive) {
            let gridfinder = this.$refs.gridfinder;
            if (gridfinder.getNode && gridfinder.getNode().getStage()) {
                let stage = gridfinder.getNode().getStage();
                isActive ? stage.on('click', this.onClick) : stage.off('click');
            }
        },
        mapId: function() {
            this.circles = [];
            this.$store.dispatch('grid/reset');
        },
    },
    methods: {
        config(circle) {
            return {
                x: circle.x,
                y: circle.y,
                radius: 15,
                fill: '#FF000000',
                stroke: '#f14c27',
                strokeWidth: 6,
                name: 'gridcircle',
                id: circle.id,
            };
        },
        verticalLineConfig(circle) {
            const { x, y } = circle;
            return {
                points: [x, y - 25, x, y + 25],
                stroke: '#f14c27',
                strokeWidth: 2,
                name: 'centerlinevert',
                id: circle.id,
            };
        },
        horizontalLineConfig(circle) {
            const { x, y } = circle;
            return {
                points: [x - 25, y, x + 25, y],
                stroke: '#f14c27',
                strokeWidth: 2,
                name: 'centerlinehoriz',
                id: circle.id,
            };
        },
        getRelativePointerPosition(node) {
            // Layer = the layer element established in Scene.vue, holds all Scene elements
            // Layer corresponds to the window size MT has available.
            // node CANNOT be the Stage (parent of all Scene canvas elements)

            // Create a reference to Layer/window of this group
            const transform = node.getAbsoluteTransform().copy();

            // Transform the reference to become RELATIVE to Layer and this group
            transform.invert();

            // Get the pointer position relative to the Layer
            const pointerPosition = node.getStage().getPointerPosition();

            // Transform the Layer/window position to the RELATIVE position
            return transform.point(pointerPosition);
        },
        onClick(e) {
            if (this.active && e.target.attrs.name != 'gridcircle') {
                this.addCircle();
            }
        },
        addCircle() {
            const pos = this.getRelativePointerPosition(this.$refs.gridfinder.getNode());
            this.circles.push({
                ...pos,
                id: ++this.lastId,
            });
            this.emitChange();
        },
        circleClicked(event) {
            event.evt.preventDefault();
            this.remove(event.target);
        },
        remove(circle) {
            var index = this.circles.findIndex(item => item.id == circle.attrs.id);
            if (index !== -1) {
                this.circles.splice(index, 1);
            }
            this.emitChange();
        },
        emitChange() {
            this.$emit('changed', this.circles);
        },
    },
};
</script>
