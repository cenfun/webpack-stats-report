<template>
    <div class="gui-main">
        <div class="gui-header gui-flex-row">
            <div class="gui-title gui-flex-auto">
                {{ info.title }}
            </div>
            <div class="gui-logo" />
        </div>
        <div class="gui-filter gui-flex-row">
            <div class="gui-checkbox">
                <input id="cb-assets" v-model="group.assets" class="gui-control-input"
                       type="checkbox"
                >
                <label class="gui-control-label" for="cb-assets" tooltip=""><b>Assets</b></label>
            </div>

            <div class="gui-separator" />

            <div class="gui-checkbox">
                <input id="cb-modules" v-model="group.modules" class="gui-control-input"
                       type="checkbox"
                >
                <label class="gui-control-label" for="cb-modules" tooltip=""><b>Modules</b></label>
            </div>

            <div class="gui-hs-10" />
            <div>Group by:</div>

            <div class="gui-arrow-next" />

            <div class="gui-checkbox">
                <input id="cb-chunk" v-model="group.chunk" class="gui-control-input"
                       type="checkbox"
                >
                <label class="gui-control-label" for="cb-chunk" tooltip="">Chunk</label>
            </div>

            <div class="gui-arrow-next" />

            <div class="gui-checkbox">
                <input id="cb-type" v-model="group.type" class="gui-control-input"
                       type="checkbox"
                >
                <label class="gui-control-label" for="cb-type" tooltip="">Type</label>
            </div>

            <div class="gui-arrow-next" />

            <div class="gui-checkbox">
                <input id="cb-folder" v-model="group.folder" class="gui-control-input"
                       type="checkbox"
                >
                <label class="gui-control-label" for="cb-folder" tooltip="">Folder</label>
            </div>
        </div>
        <div class="gui-filter gui-flex-row">
            <b>Filter:</b>
            <input v-model="keywords.chunk" class="gui-input" name="chunk"
                   placeholder="Chunk" title="Chunk" @focus="$event.target.select()"
            >
            <input v-model="keywords.type" class="gui-input" name="type"
                   placeholder="Type" title="Type" @focus="$event.target.select()"
            >
            <input v-model="keywords.name" class="gui-input" name="name"
                   placeholder="Name" title="Chunk" @focus="$event.target.select()"
            >
            <span v-if="group.modules">Found <b>{{ filterModules }}</b> modules (Size: {{ filterSize }})</span>
        </div>
        <div class="gui-grid gui-flex-auto" />
        <div class="gui-footer gui-flex-row">
            <div class="gui-flex-auto">
                <b class="gui-link gui-module-types" @click="showModuleTypes">Module Types</b>
                <b :class="info.warningsClass" @click="showInfo('Warnings', info.warnings)">Warnings {{ info.warnings.length }}</b>
                <b :class="info.errorsClass" @click="showInfo('Errors', info.errors)">Errors {{ info.errors.length }}</b>
            </div>
            <div class="gui-flex-row">
                <div class="gui-time">
                    Generated {{ info.timeH }}
                </div>
                <div class="gui-hs-10" />
                <a href="https://webpack.js.org/" target="_blank">webpack</a>
                <div class="gui-hs-5" />
                <div>v{{ info.version }}</div>
            </div>
        </div>
    </div>
</template>
<script>
import createElement from "./helper/create-element.js";
import Util from "./helper/util.js";
import Popup from "./components/popup.vue";
import PopupDetail from "./components/popup-detail.vue";
import PopupModuleTypes from "./components/popup-module-types.vue";
import PopupInfo from "./components/popup-info.vue";

import MixinFilter from "./mixin/mixin-filter.js";
import MixinGroup from "./mixin/mixin-group.js";
import MixinGrid from "./mixin/mixin-grid.js";

const App = {
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
                this.renderGrid();
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

        this.group.assets = !!Util.store.get("assets");

        this.initGridColumns();
        this.initInfo();
    },

    mounted() {
        this.renderGrid();
    },

    methods: {

        initInfo() {
            this.info = {
                ... this.statsData.info,
                title: this.statsData.title
            };

            if (this.info.warnings.length > 0) {
                this.info.warningsClass = "gui-link gui-info-warnings";
            } else {
                this.info.warningsClass = "gui-info-disabled";
            }
            if (this.info.errors.length > 0) {
                this.info.errorsClass = "gui-link gui-info-errors";
            } else {
                this.info.errorsClass = "gui-info-disabled";
            }
            this.info.timeH = new Date(this.info.timestamp).toLocaleString();
        },

        select(e) {
            e.target.select();
        },
    
        showDetail(rowData) {
            Popup.create((h) => {
                return {
                    props: {
                        title: "Module Detail"
                    },
                    scopedSlots: {
                        default: (props) => {
                            return h(PopupDetail, {
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
            Popup.create((h) => {
                return {
                    props: {
                        title: "Module Types"
                    },
                    scopedSlots: {
                        default: (props) => {
                            return h(PopupModuleTypes, {
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
            Popup.create((h) => {
                return {
                    props: {
                        title: title
                    },
                    scopedSlots: {
                        default: (props) => {
                            return h(PopupInfo, {
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