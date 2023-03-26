<template>
    <div class="debugger">
        <VueJsonPretty :data="debugMessage" :deep="1" />
    </div>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';

export default {
    name: 'Debugger',
    components: {
        VueJsonPretty: VueJsonPretty,
    },
    props: {
        debugMessage: {
            type: Object,
            required: true,
        },
    },
};
</script>

<style lang="scss" scoped>
.debugger {
    background-color: black;
    width: 500px;
    height: fit-content;
    transform: translateY(-105%);
    margin-left: 100px;
    margin-right: 300px;
    padding: 8px;
}
</style>
