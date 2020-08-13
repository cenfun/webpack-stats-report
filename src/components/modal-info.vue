<template>
    <div class="lui-modal-list">
        <div v-for="(item, i) in list" :key="i" class="lui-modal-item">
            <pre><code>{{ i+1 }}. {{ formatItem(item) }}</code></pre>
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
    },

    methods: {
        formatItem(item) {
            //webpack5 is object
            if (typeof item === "object" && item.stack) {
                return item.stack;
            }
            //webpack4 is string
            return item;
        }
    }
};
</script>