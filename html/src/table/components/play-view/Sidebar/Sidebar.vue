<template>
    <div class="sidebar" :class="{ hidden: hidden }">
        <div class="sidebar-content">
            <slot />
        </div>
        <div class="sidebar-arrow" @click="toggleHide" :class="{ flip: hidden }">
            <img src="/static/icons/layout/right_arrow.svg" />
        </div>
    </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
export default {
    computed: {
        ...mapState('editingModes', {
            hidden: 'hiddenSidebar',
        }),
        ...mapState('window', {
            windowSize: 'windowSize',
        }),
    },
    watch: {
        windowSize: {
            handler() {
                this.windowSizeCheck();
            },
            deep: true,
        },
    },
    mounted() {
        //check window size on launch
        this.windowSizeCheck();
    },
    methods: {
        ...mapMutations('editingModes', {
            setHidden: 'setHiddenSidebar',
            toggleHidden: 'toggleHiddenSidebar',
        }),
        toggleHide() {
            this.toggleHidden();
        },
        windowSizeCheck() {
            //if the window is less than 1000px wide, hide by default
            if (window.innerWidth < 1100) {
                this.setHidden(true);
            }
        },
    },
};
</script>

<style lang="scss" scoped>
//smaller screens
@media screen and (max-width: 1400px) and (min-width: 700px) {
    .sidebar {
        width: 350px !important;
    }
    .sidebar.hidden {
        right: -350px !important;
    }
}
@media screen and (max-width: 700px) {
    .sidebar {
        width: 90% !important;
    }
    .sidebar.hidden {
        right: -90% !important;
    }
    .sidebar-arrow {
        top: auto !important;
        bottom: 75px !important;
    }
}
.sidebar {
    background: linear-gradient(90deg, rgba(0, 0, 0, 0.39) 0%, rgba(0, 0, 0, 0.42) 100%);
    backdrop-filter: blur(10px) saturate(140%);

    height: 100%;
    width: 450px;

    position: fixed;
    top: 0px;
    right: 0px;

    overflow-x: visible;
    transition: right 0.5s ease;
}
.sidebar.hidden {
    right: -450px;
}
.sidebar-content {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    overflow-y: auto;
    padding: 20px 20px;
}
.sidebar-arrow {
    position: absolute;

    top: 20px;
    //offsetting this value by 1 fixes gaps on zoom and hidpi
    left: -31px;
    width: 31px;
    height: 60px;

    background: rgba(0, 0, 0, 0.69);
    z-index: 1000;

    display: flex;
    justify-content: center;
    align-items: center;

    border-radius: 10px 0px 0px 10px;
    cursor: pointer;
    img {
        transition: transform 0.5s ease;
        height: 30px;
    }
}
.sidebar-arrow.flip {
    img {
        transform: rotateY(180deg);
    }
}
.sidebar-arrow:hover {
    background: rgba(0, 0, 0, 0.49);
}
</style>
