<template>
  <div
    v-if="rowData"
    class="vui-detail"
  >
    <div class="vui-modal-block">
      <div class="vui-modal-label">
        Name:
      </div>
      <div v-if="rowData.loaders">
        <div
          v-for="(item, i) in rowData.loaders"
          :key="i"
          class="vui-modal-item"
        >
          {{ item }}
          <div class="vui-modal-next" />
        </div>
      </div>
      <div class="vui-modal-item">
        {{ rowData.name }}
      </div>
    </div>

    <div
      v-if="rowData.paths"
      class="vui-modal-block"
    >
      <div class="vui-modal-label">
        Paths:
      </div>
      <div
        v-for="(item, index) in rowData.paths"
        :key="index"
        class="vui-modal-item"
      >
        <div class="vui-modal-arrow" />
        {{ item }}
      </div>
    </div>

    <div
      v-if="rowData.bailout"
      class="vui-modal-block"
    >
      <div class="vui-modal-label">
        Bailout:
      </div>
      <div
        v-for="(item, index) in rowData.bailout"
        :key="index"
        class="vui-modal-item"
      >
        {{ item }}
      </div>
    </div>
  </div>
</template>
<script>

export default {
    props: {
        rowData: {
            type: Object,
            default: null
        }
    }

};
</script>
<style lang="scss">
.vui-detail {
    width: 100%;
    height: 100%;
    overflow: auto;
}
</style>
