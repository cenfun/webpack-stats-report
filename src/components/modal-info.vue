<template>
  <div class="vui-info">
    <div
      v-for="(item, i) in props.list"
      :key="i"
      class="vui-modal-item"
    >
      <pre><code>{{ i+1 }}. {{ formatItem(item) }}</code></pre>
    </div>
  </div>
</template>
<script setup>

const props = defineProps({
    list: {
        type: Array,
        default: () => ([])
    }
});

const formatItem = (item) => {
    //webpack5 is object
    if (typeof item === 'object' && item.stack) {
        return item.stack;
    }
    //webpack4 is string
    return item;
};

</script>
<style lang="scss">
.vui-info {
    width: 100%;
    height: 100%;
    overflow: auto;
}
</style>
