<template>
    <div class="gui-detail">
        <div class="gui-popup-label">
            Name:
        </div>
        <div class="gui-popup-item">
            <div class="gui-flex-row">
                <div v-for="(loader, i) in rowData.loaders" :key="i" class="gui-loader gui-arrow-next">
                    {{ loader }}-loader
                </div>
            </div>
            {{ rowData.name }}
        </div>

        <div v-if="rowData.fullName" class="gui-popup-tip">
            <div class="gui-popup-label">
                Full Name:
            </div>
            <div class="gui-popup-item">
                {{ rowData.fullName }}
            </div>
        </div>

        <div v-if="rowData.asset">
            <div class="gui-popup-label">
                Asset:
            </div>
            <div class="gui-popup-item">
                {{ rowData.asset }}
            </div>
        </div>

        <div v-if="rowData.issuerPath.length">
            <div class="gui-popup-label">
                Path:
            </div>
            <div class="gui-popup-list">
                <div v-for="(item, index) in rowData.issuerPath" :key="index" class="gui-popup-item">
                    <div class="gui-popup-arrow" />
                    {{ item }}
                </div>
            </div>
        </div>

        <div class="gui-popup-label">
            Chunk:
        </div>
        <div class="gui-popup-item">
            <div class="gui-popup-arrow" />
            {{ rowData.chunk }}
        </div>
    </div>
</template>
<script>

export default {
    props: {
        rowData: {
            type: Object,
            default: () => ({})
        }
    }

};
</script>
<style>
.gui-popup-item .gui-loader {
    display: inline-block;
    white-space: nowrap;
    padding-right: 18px;
    width: auto;
    background-position-x: right;
    height: auto;
    margin: 0;
}
</style>