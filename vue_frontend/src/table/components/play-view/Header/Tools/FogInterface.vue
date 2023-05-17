<template>
    <ul>
        <h5>Fog of War</h5>
        <li class="obscure-reveal">
            <button
                id="obscure"
                @click="() => setObscuring(true)"
                :class="{ active: willObscure }"
                @mouseover="hoverObscure = true"
                @mouseleave="hoverObscure = false"
                aria-labelledby="obscure-label"
            >
                <img
                    src="/static/icons/fog-of-war/obscure.svg"
                    alt="Obscure the player's view of portions of the map."
                />
            </button>
            <h6 v-show="hoverObscure" id="obscure-label" class="icon-label" :class="{ active: willObscure }">
                Obscure Drawing Tool
                <div aria-hidden />
            </h6>

            <button
                id="reveal"
                @click="() => setObscuring(false)"
                :class="{ active: !willObscure }"
                @mouseover="hoverReveal = true"
                @mouseleave="hoverReveal = false"
                aria-labelledby="reveal-label"
            >
                <img src="/static/icons/fog-of-war/reveal.svg" alt="Reveal the player's view of portions of the map." />
            </button>
            <h6 v-show="hoverReveal" id="reveal-label" class="icon-label" :class="{ active: !willObscure }">
                Reveal Drawing Tool
                <div aria-hidden />
            </h6>
        </li>
        <li>Click and drag to {{ willObscure ? 'hide' : 'reveal' }} a rectangular area.</li>
        <li class="obscure-reveal-all">
            <h6>Entire Map:</h6>
            <button id="obscure-all" @click="() => updateAllFog('obscure')">
                Obscure All
            </button>
            <button id="reveal-all" @click="() => updateAllFog('reveal')">
                Reveal All
            </button>
        </li>
        <li>
            *Only you can see through the fog.
        </li>
    </ul>
</template>

<script>
import { mapMutations, mapState, mapActions } from 'vuex';
import _ from 'lodash';
import * as jsonpatch from 'fast-json-patch';

import { COLLECTION_TYPES } from '@/core/collections/constants.js';

export default {
    data() {
        return {
            hoverReveal: false,
            hoverObscure: false,
        };
    },
    computed: {
        ...mapState('fog', {
            willObscure: 'obscure',
        }),
        ...mapState('gamestate', {
            activeMap: 'activeMap',
            mapShapes: 'mapShapes',
        }),
    },
    methods: {
        ...mapMutations('fog', {
            setObscuring: 'setObscure',
        }),
        ...mapActions('collections', {
            updateMap: 'update',
        }),
        updateAllFog(operation) {
            const clonedMap = _.cloneDeep(this.activeMap);
            if (!('fog' in clonedMap.stage)) {
                clonedMap.stage.fog = {};
            }
            clonedMap.stage.fog.shapes = [];
            if (operation === 'obscure') {
                this.mapShapes.forEach(shape => {
                    clonedMap.stage.fog.shapes.push({
                        konvaComponent: 'v-rect',
                        config: {
                            ..._.cloneDeep(shape),
                            fill: '#000',
                            globalCompositeOperation: 'source-over',
                            listening: false,
                        },
                    });
                });
            }
            const patch = jsonpatch.compare(this.activeMap, clonedMap);
            if (patch.length > 0) {
                this.updateMap({ collection: COLLECTION_TYPES.maps, id: this.activeMap._id, patch: patch });
            }
        },
    },
};
</script>

<style lang="scss" scoped>
$obscure-color: #a700f2;
$reveal-color: #f2e400;

ul {
    max-width: 250px;
}
h5 {
    margin: 0 0 10px 0;
}
li {
    display: flex;
    align-items: center;
    margin: 0 0 12px 0;
    font-size: 0.75rem;
}
li:last-of-type {
    margin: 0 0 0 0;
}
ul button {
    box-sizing: border-box;
    margin: 0 0 0 0;
    padding-left: 5px;
    padding-right: 5px;
    min-width: fit-content;
    font-weight: 600;
    font-size: 1rem;
    background-color: #31313a;
}
button:hover {
    box-shadow: 0 0 3px var(--white);
}
li button:last-child {
    margin: 0;
}
.obscure-reveal {
    display: flex;
    justify-content: space-evenly;
    button {
        margin: 0 0 0 0;
        padding: 15px 15px 15px 15px;
        border-radius: 50%;
        img {
            width: 60px;
            height: 60px;
        }
    }
}
.obscure-reveal-all {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
    h6 {
        flex-basis: 100%;
    }
    button {
        width: 12ch;
        padding: 8px 10px 8px 10px;
        margin: 0 0 0 0;
    }
}
#obscure.active {
    box-shadow: inset 0 0 3px 5px $obscure-color;
}
#reveal.active {
    box-shadow: inset 0 0 3px 5px $reveal-color;
}
#obscure-all:active,
#obscure-all:hover,
#obscure-label.active {
    color: $obscure-color;
    font-weight: 800;
}
#reveal-all:active,
#reveal-all:hover,
#reveal-label.active {
    color: $reveal-color;
    font-weight: 800;
}
.icon-label {
    position: absolute;
    white-space: nowrap;
    left: 0;
    margin: 0 0 0 calc(100% + 8px);
    padding: 8px 8px 8px 8px;
    font-size: 1.25rem;
    font-weight: 600;
    background-color: #31313af1;
    border-radius: 0.7em;
}
.icon-label div,
.icon-label div {
    display: flex;
    position: absolute;
    top: 50%;
    right: 100%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border: 6px solid;
    border-color: transparent #31313af1 transparent transparent;
}
</style>
