<template>
    <ul>
        <h6>Color</h6>
        <ul class="selectors">
            <DrawingSelector
                v-for="(color, index) in drawingColors"
                :key="index"
                :color="color"
                dispatchTo="drawing/updateColor"
                :selected="activeColor === color"
            />
        </ul>
        <h6>Brush Size</h6>
        <ul class="selectors">
            <DrawingSelector
                v-for="(brushSize, index) in brushSizes"
                :key="index"
                :size="`${brushSize + brushRenderModifier}px`"
                dispatchTo="drawing/updateBrushSize"
                :selected="activeBrush === brushSize"
            />
        </ul>
    </ul>
</template>

<script>
import { mapState } from 'vuex';

import DrawingSelector from './DrawingSelector.vue';

export default {
    components: {
        DrawingSelector: DrawingSelector,
    },
    computed: {
        ...mapState('drawing', {
            drawingColors: 'drawingColors',
            activeColor: 'activeColor',
            brushSizes: 'brushSizes',
            activeBrush: 'activeBrushSize',
            brushRenderModifier: 'brushRenderSizeModifier',
        }),
    },
};
</script>

<style lang="scss" scoped>
ul ul:first-of-type {
    margin-bottom: 1rem;
}
h6 {
    font-size: 1.25rem;
}
.selectors {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0;
}
.selectors ::v-deep li:first-child {
    margin-left: 0.25rem;
}
.selectors ::v-deep li {
    margin-right: 0.5rem;
}
.selectors ::v-deep li:last-child {
    margin-right: 0;
}
</style>
