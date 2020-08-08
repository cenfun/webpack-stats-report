<template>
    <div class="gui-detail">
        <div class="gui-name">
            <div class="gui-popup-label">
                Name:
            </div>
            <div class="gui-popup-item">
                {{ nameContent }}
                <div v-if="rowData.fullName" class="gui-popup-tip">
                    ({{ rowData.fullName }})
                </div>
            </div>
        </div>

        <div v-if="rowData.asset" class="gui-asset">
            <div class="gui-popup-label">
                Asset:
            </div>
            <div class="gui-popup-item">
                {{ rowData.asset }}
            </div>
        </div>

        <div v-if="rowData.issuerPath.length" class="gui-path">
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

        <div class="gui-chunk">
            <div class="gui-popup-label">
                Chunk:
            </div>
            <div class="gui-popup-item">
                <div class="gui-popup-arrow" />
                {{ rowData.chunk }}
            </div>
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
    },

    data() {
        return {
            nameContent: ""
        };
    },

    created() {
        let str = "";
        if (this.rowData.loaders) {
            str += this.rowData.loaders.map(item => `${item}-loader -&gt; `).join("");
        }
        str += this.rowData.name;
        this.nameContent = str;
    }

};
</script>