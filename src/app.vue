<template>
    <div class="lui-main">
        <div class="lui-header lui-flex-row">
            <div class="lui-title lui-flex-auto">
                {{ info.title }}
            </div>
            <div class="lui-flex-row" />
        </div>
        <div class="lui-filter lui-flex-row">
            <div class="lui-flex-auto lui-flex-row">
                <LuiCheckbox v-model="group.assets">
                    <b>Assets</b>
                </LuiCheckbox>
                <div class="lui-separator" />
                <LuiCheckbox v-model="group.modules">
                    <b>Modules</b>
                </LuiCheckbox>
                <div class="lui-hs-10" />
                <div>Group:</div>
                <div class="lui-hs-5" />
                <LuiCheckbox v-model="group.chunk" label="Chunk" />
                <div class="lui-arrow-next" />
                <LuiCheckbox v-model="group.type" label="Type" />
                <div class="lui-arrow-next" />
                <LuiCheckbox v-model="group.folder" label="Folder" />
            </div>
            <div v-if="info.hasMinifiedAndGzipSize" class="lui-flex-row">
                <div>Size:</div>
                <div class="lui-hs-5" />
                <LuiCheckbox v-model="size.minified" label="Minified" />
                <div class="lui-arrow-next" />
                <LuiCheckbox v-model="size.gzip" label="Gzip" />
            </div>
        </div>
        <div class="lui-filter lui-flex-row">
            <LuiInput v-model="keywords.chunk"
                      name="chunk"
                      placeholder="Chunk"
                      title="Chunk"
            >
                <b>Filter:</b>
            </LuiInput>
            <LuiInput v-model="keywords.type"
                      name="type"
                      placeholder="Type"
                      title="Type"
            />
            <LuiInput v-model="keywords.name"
                      name="name"
                      placeholder="Name"
                      title="Chunk"
                      width="150px"
            />
            <span v-if="group.modules" class="lui-filter-info">Found <b>{{ filterModules }}</b> modules (Size: {{ filterSize }})</span>
        </div>
        <div class="lui-grid lui-flex-auto" />
        <div class="lui-footer lui-flex-row">
            <div class="lui-flex-auto">
                <b class="lui-link lui-module-types" @click="showModuleTypes">Module Types</b>
                <b :class="info.warningsClass" @click="showInfo('Webpack Warnings', info.warnings)">Warnings {{ info.warnings.length }}</b>
                <b :class="info.errorsClass" @click="showInfo('Webpack Errors', info.errors)">Errors {{ info.errors.length }}</b>
            </div>
            <div class="lui-flex-row">
                <div class="lui-time">
                    Generated {{ info.timeH }}
                </div>
                <div class="lui-hs-10" />
                <a href="https://webpack.js.org/" target="_blank">webpack</a>
                <div class="lui-hs-5" />
                <div>v{{ info.version }}</div>
            </div>
        </div>
    </div>
</template>
<script>
import Util from "./helper/util.js";

import {
    createElement,
    LuiCheckbox,
    LuiInput,
    LuiModal
} from "lithops-ui";

import ModalDetail from "./components/modal-detail.vue";
import ModalModuleTypes from "./components/modal-module-types.vue";
import ModalInfo from "./components/modal-info.vue";

import MixinFilter from "./mixin/mixin-filter.js";
import MixinGroup from "./mixin/mixin-group.js";
import MixinGrid from "./mixin/mixin-grid.js";

const App = {
    components: {
        LuiCheckbox,
        LuiInput
    },
    mixins: [
        MixinFilter,
        MixinGroup,
        MixinGrid
    ],
    data() {
        return {
            info: {},

            group: {
                assets: true,
                modules: true,
                chunk: false,
                type: false,
                folder: false
            },
            size: {
                minified: false,
                gzip: false
            },

            keywords: {
                chunk: "",
                type: "",
                name: ""
            },
            filterModules: 0,
            filterSize: ""
        };
    },

    watch: {
        group: {
            deep: true,
            handler: function() {
                this.saveStore();
                this.renderGrid();
            }
        },
        size: {
            deep: true,
            handler: function() {
                this.saveStore();
                this.updateGridColumns();
            }
        },
        keywords: {
            deep: true,
            handler: function() {
                this.updateGrid();
            }
        }
    },

    created() {
        this.statsData = Util.initStatsData(window.statsData);
        console.log(this.statsData);
        this.initInfo();
        //after info
        this.initStore();
    },

    mounted() {
        this.renderGrid();
    },

    methods: {

        initStore() {
            Object.keys(this.group).forEach(k => {
                if (k === "modules") {
                    return;
                }
                this.group[k] = !!Util.store.get(k);
            });
            if (this.info.hasMinifiedAndGzipSize) {
                Object.keys(this.size).forEach(k => {
                    this.size[k] = !!Util.store.get(k);
                });
            }
        },

        saveStore() {
            Object.keys(this.group).forEach(k => {
                if (k === "modules") {
                    return;
                }
                Util.store.set(k, this.group[k] ? 1 : "");
            });
            Object.keys(this.size).forEach(k => {
                Util.store.set(k, this.size[k] ? 1 : "");
            });
        },

        initInfo() {
            this.info = {
                ... this.statsData.info,
                title: this.statsData.title
            };

            if (this.info.warnings.length > 0) {
                this.info.warningsClass = "lui-link lui-info-warnings";
            } else {
                this.info.warningsClass = "lui-info-disabled";
            }
            if (this.info.errors.length > 0) {
                this.info.errorsClass = "lui-link lui-info-errors";
            } else {
                this.info.errorsClass = "lui-info-disabled";
            }
            this.info.timeH = new Date(this.info.timestamp).toLocaleString();
        },

        showDetail(rowData) {
            LuiModal.create((h) => {
                return {
                    props: {
                        title: "Module Detail"
                    },
                    scopedSlots: {
                        default: (props) => {
                            return h(ModalDetail, {
                                props: {
                                    rowData: rowData
                                }
                            });
                        }
                    }
                };
            });
        },

        showModuleTypes() {
            LuiModal.create((h) => {
                return {
                    props: {
                        title: "Module Types Definition"
                    },
                    scopedSlots: {
                        default: (props) => {
                            return h(ModalModuleTypes, {
                                props: {
                                    moduleTypes: this.statsData.info.moduleTypes
                                }
                            });
                        }
                    }
                };
            });
        },
        
        showInfo(title, list) {
            if (!list || !list.length) {
                return;
            }
            LuiModal.create((h) => {
                return {
                    props: {
                        title: title
                    },
                    scopedSlots: {
                        default: (props) => {
                            return h(ModalInfo, {
                                props: {
                                    list: list
                                }
                            });
                        }
                    }
                };
            });
        }
    
    }
    
};

App.create = (option, container) => {
    return createElement(App, option, container);
};

export default App;
</script>
<style src="./app.scss"></style>