<template>
    <div class="gui-popup-list">
        <div v-for="(item, i) in list" :key="i" class="gui-popup-item">
            <pre><code>{{ i+1 }}. {{ item }}</code></pre>
        </div>
    </div>
</template>
<script>
export default {
    props: {
        list: {
            type: Array,
            default: () => ([])
        }
    },

    data() {
        return {
            items: []
        };
    }
};
</script>