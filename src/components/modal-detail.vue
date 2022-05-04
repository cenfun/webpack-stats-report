<template>
  <div
    v-if="rowData"
    class="lui-detail"
  >
    <div class="lui-modal-label">
      Name:
    </div>
    <div class="lui-modal-item">
      <div>
        <div
          v-for="(loader, i) in rowData.loaders"
          :key="i"
          class="lui-loader lui-arrow-next"
        >
          <a
            target="_blank"
            :href="'https://www.npmjs.com/package/'+loader+'-loader'"
          >{{ loader }}-loader</a>
        </div>
      </div>
      {{ rowData.name }}
    </div>

    <div
      v-if="rowData.fullName"
      class="lui-modal-tip"
    >
      <div class="lui-modal-label">
        Full Name:
      </div>
      <div class="lui-modal-item">
        {{ rowData.fullName }}
      </div>
    </div>

    <div v-if="rowData.asset">
      <div class="lui-modal-label">
        Asset:
      </div>
      <div class="lui-modal-item">
        {{ rowData.asset }}
      </div>
    </div>

    <div v-if="rowData.issuerPath.length">
      <div class="lui-modal-label">
        Path:
      </div>
      <div class="lui-modal-list">
        <div
          v-for="(item, index) in rowData.issuerPath"
          :key="index"
          class="lui-modal-item"
        >
          <div class="lui-modal-arrow" />
          {{ item }}
        </div>
      </div>
    </div>

    <div v-if="rowData.chunk">
      <div class="lui-modal-label">
        Chunk:
      </div>
      <div class="lui-modal-item">
        <div class="lui-modal-arrow" />
        {{ rowData.chunk }}
      </div>
    </div>

    <div class="lui-modal-label">
      Type:
    </div>
    <div class="lui-modal-item">
      {{ rowData.type }}
    </div>

    <div class="lui-modal-label">
      Size:
    </div>
    <div class="lui-modal-item">
      {{ rowData.sizeH }}
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
.lui-detail {
    width: 100%;
    height: 100%;
    overflow: auto;
}

.lui-modal-item .lui-loader {
    display: inline-block;
    white-space: nowrap;
    padding-right: 18px;
    width: auto;
    background-position-x: right;
    height: auto;
    margin: 0;
}

</style>