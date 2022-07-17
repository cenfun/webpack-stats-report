<template>
  <div
    v-if="props.rowData"
    class="vui-detail"
  >
    <div class="vui-modal-block">
      <div class="vui-modal-label">
        Name:
      </div>
      <div v-if="props.rowData.loaders">
        <div
          v-for="(item, i) in props.rowData.loaders"
          :key="i"
          class="vui-modal-item"
        >
          ❁{{ item }} ▷
        </div>
      </div>
      <div class="vui-modal-item">
        {{ props.rowData.name }}
      </div>
    </div>

    <div
      v-if="props.rowData.paths"
      class="vui-modal-block"
    >
      <div class="vui-modal-label">
        Paths:
      </div>
      <div
        v-for="(item, index) in props.rowData.paths"
        :key="index"
        class="vui-modal-item"
      >
        <div class="vui-modal-arrow" />
        {{ item }}
      </div>
    </div>

    <div
      v-if="props.rowData.bailout"
      class="vui-modal-block"
    >
      <div class="vui-modal-label">
        Bailout:
      </div>
      <div
        v-for="(item, index) in props.rowData.bailout"
        :key="index"
        class="vui-modal-item"
      >
        {{ item }}
      </div>
    </div>
  </div>
</template>
<script setup>

const props = defineProps({
    rowData: {
        type: Object,
        default: null
    }
});

</script>
<style lang="scss">
.vui-detail {
    width: 100%;
    height: 100%;
    overflow: auto;
}
</style>
