<template>
  <div class="lui-main">
    <div class="lui-header lui-flex-row">
      <div class="lui-title lui-flex-auto">
        {{ info.title }}
      </div>
      <div class="lui-flex-row">
        <a
          href="https://webpack.js.org/"
          target="_blank"
        >webpack v{{ info.version }}</a>
      </div>
    </div>
    <div class="lui-filter">
      <LuiFlex spacing="10">
        <LuiCheckbox v-model="group.assets">
          <b>Assets</b>
        </LuiCheckbox>
        <div class="lui-separator" />
        <LuiCheckbox v-model="group.modules">
          <b>Modules</b>
        </LuiCheckbox>
        <LuiCheckbox
          v-model="group.chunk"
          label="Chunk"
        />
        <div class="lui-arrow-next" />
        <LuiCheckbox
          v-model="group.type"
          label="Type"
        />
        <div class="lui-arrow-next" />
        <LuiCheckbox
          v-model="group.folder"
          label="Folder"
        />
        <div class="lui-flex-empty" />
        <LuiFlex
          v-if="info.hasMinifiedAndGzipSize"
          spacing="5"
        >
          <LuiCheckbox
            v-model="size.minified"
            label="Minified"
          />
          <div class="lui-arrow-next" />
          <LuiCheckbox
            v-model="size.gzip"
            label="Gzip"
          />
        </LuiFlex>
      </LuiFlex>
    </div>
    <div class="lui-filter">
      <LuiFlex spacing="10">
        <div>Filter:</div>
        <LuiInput
          v-model="keywords.name"
          name="name"
          placeholder="Name"
          title="Chunk"
          width="150px"
        />
        <LuiInput
          v-model="keywords.chunk"
          name="chunk"
          placeholder="Chunk"
          title="Chunk"
        />
        <LuiInput
          v-model="keywords.type"
          name="type"
          placeholder="Type"
          title="Type"
        />
        <span
          v-if="group.modules && !hasGroup"
          class="lui-filter-info"
        >Found <b>{{ filterModules }}</b> modules ({{ filterSize }})</span>
      </LuiFlex>
    </div>
    <div class="lui-grid lui-flex-auto" />
    <div class="lui-footer lui-flex-row">
      <div class="lui-flex-auto">
        <b
          class="lui-link lui-module-types"
          @click="showModuleTypes"
        >Module Types</b>
        <b
          :class="info.warningsClass"
          @click="showInfo('Webpack Warnings', info.warnings)"
        >Warnings {{ info.warnings.length }}</b>
        <b
          :class="info.errorsClass"
          @click="showInfo('Webpack Errors', info.errors)"
        >Errors {{ info.errors.length }}</b>
      </div>
      <div class="lui-flex-row">
        <div class="lui-time">
          Generated {{ info.timeH }} in {{ info.durationH }} by <a
            href="https://github.com/cenfun/webpack-stats-report"
            target="_blank"
          >WSR</a>
        </div>
      </div>
    </div>
    <LuiFlyover
      ref="flyover"
      :visible="flyoverVisible"
      width="50%"
      position="right"
    >
      <div class="lui-flyover-main lui-flex-column">
        <div class="lui-flyover-header">
          <LuiFlex spacing="10">
            <div
              class="lui-flyover-icon"
              @click="flyoverVisible=false"
            >
              <div class="lui-icon lui-icon-arrow-right" />
            </div>
            <div class="lui-flyover-title lui-flex-auto">
              Detail
            </div>

            <!-- <div
              v-if="!flyoverMaximize"
              class="lui-flyover-icon"
              @click="flyoverMaximize=true"
            >
              <div class="lui-icon lui-icon-maximize" />
            </div>

            <div
              v-if="flyoverMaximize"
              class="lui-flyover-icon"
              @click="flyoverMaximize=false"
            >
              <div class="lui-icon lui-icon-restore" />
            </div> -->

            <div
              class="lui-flyover-icon"
              @click="flyoverVisible=false"
            >
              <div class="lui-icon lui-icon-close" />
            </div>
          </LuiFlex>
        </div>
        <div class="lui-flyover-content lui-flex-auto">
          <ModalDetail :row-data="flyoverData" />
        </div>
      </div>
    </LuiFlyover>
  </div>
</template>
<script>
import decompress from 'lz-utils/lib/decompress.js';
import Util from './helper/util.js';

import {
    createElement,
    LuiCheckbox,
    LuiInput,
    LuiFlex,
    LuiModal,
    LuiFlyover
} from 'lithops-ui';

import ModalDetail from './components/modal-detail.vue';
import ModalModuleTypes from './components/modal-module-types.vue';
import ModalInfo from './components/modal-info.vue';

const mixins = [];
const context = require.context('./mixin', true, /\.js$/);
const paths = context.keys();
paths.forEach((path) => {
    mixins.push(context(path).default);
});

const App = {
    components: {
        LuiFlex,
        LuiCheckbox,
        LuiInput,
        LuiFlyover,
        ModalDetail
    },
    mixins: mixins,
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
                chunk: '',
                type: '',
                name: ''
            },
            filterModules: 0,
            filterSize: '',

            flyoverVisible: false,
            //flyoverMaximize: false,
            flyoverData: null
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

    computed: {
        hasGroup: function() {
            const g = this.group;
            if (g.chunk || g.type || g.folder) {
                return true;
            }
            return false;
        }
    },

    created() {
        const statsData = JSON.parse(decompress(window.statsData));
        this.statsData = Util.initStatsData(statsData);
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
                if (k === 'modules') {
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
                if (k === 'modules') {
                    return;
                }
                Util.store.set(k, this.group[k] ? 1 : '');
            });
            Object.keys(this.size).forEach(k => {
                Util.store.set(k, this.size[k] ? 1 : '');
            });
        },

        initInfo() {
            this.info = {
                ... this.statsData.info,
                title: this.statsData.title
            };

            if (this.info.warnings.length > 0) {
                this.info.warningsClass = 'lui-link lui-info-warnings';
            } else {
                this.info.warningsClass = 'lui-info-disabled';
            }
            if (this.info.errors.length > 0) {
                this.info.errorsClass = 'lui-link lui-info-errors';
            } else {
                this.info.errorsClass = 'lui-info-disabled';
            }
            this.info.timeH = new Date(this.info.timestamp).toLocaleString();
            this.info.durationH = Util.TF(this.info.duration, 's', 2);
        },


        showFlyover(rowData, force) {

            if (!this.flyoverVisible && !force) {
                return;
            }

            this.flyoverVisible = true;

            rowData.sizeH = Util.BF(rowData.size);
            this.flyoverData = rowData;

        },

        showModuleTypes() {
            LuiModal.create((h) => {
                return {
                    props: {
                        title: 'Module Types Definition'
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
<style lang="scss" src="./app.scss"></style>