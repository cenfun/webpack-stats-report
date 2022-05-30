<template>
  <div
    v-if="rowData"
    class="vui-detail"
  >
    <div class="vui-modal-label">
      Name:
    </div>
    <div class="vui-modal-item">
      <div
        v-for="(loader, i) in rowData.loaders"
        :key="i"
        class="vui-loader"
      >
        <a
          target="_blank"
          :href="'https://www.npmjs.com/package/'+loader+'-loader'"
        >{{ loader }}-loader</a>
      </div>
      {{ rowData.name }}
    </div>

    <div
      v-if="rowData.fullName"
      class="vui-modal-tip"
    >
      <div class="vui-modal-label">
        Full Name:
      </div>
      <div class="vui-modal-item">
        {{ rowData.fullName }}
      </div>
    </div>

    <div v-if="rowData.asset">
      <div class="vui-modal-label">
        Asset:
      </div>
      <div class="vui-modal-item">
        {{ rowData.asset }}
      </div>
    </div>

    <div v-if="rowData.issuerPath.length">
      <div class="vui-modal-label">
        Path:
      </div>
      <div class="vui-modal-list">
        <div
          v-for="(item, index) in rowData.issuerPath"
          :key="index"
          class="vui-modal-item"
        >
          <div class="vui-modal-arrow" />
          {{ item }}
        </div>
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

.vui-modal-item .vui-loader {
    display: inline-block;
    white-space: nowrap;
    padding-right: 20px;
    background-repeat: no-repeat;
    background-position: right 3px center;
    background-image: url("../images/arrow-right.svg");
}


</style>
