<template>
  <div class="vui-main">
    <VuiTab
      v-model="tabActive"
      position="left"
    >
      <template #toolbar>
        <div class="vui-title vui-flex-auto">
          {{ info.title }}
        </div>
        <VuiFlex spacing="10">
          <a
            class="vui-icon vui-icon-webpack"
            :title="'Webpack v'+info.version"
            href="https://webpack.js.org/"
            target="_blank"
          />
          <a
            class="vui-icon vui-icon-github"
            title="Webpack Stats Report"
            href="https://github.com/cenfun/webpack-stats-report"
            target="_blank"
          />
        </VuiFlex>
      </template>

      <template #tabs>
        <div class="vui-flex-row">
          <div class="vui-icon vui-icon-modules" />
          <b>Modules</b>
        </div>
        <div class="vui-flex-row">
          <div class="vui-icon vui-icon-assets" />
          <b>Assets</b>
        </div>
      </template>
      <template #panes>
        <div class="vui-pane">
          <div class="vui-filter">
            <VuiFlex spacing="10">
              <div><b>Filter:</b></div>
              <VuiInput
                v-model="keywords.modules"
                name="name"
                placeholder="Name"
                width="200px"
              />
              <div class="vui-filter-info">
                {{ moduleInfo }}
              </div>
              <div class="vui-flex-empty" />
              <div><b>Group:</b></div>
              <VuiCheckbox
                v-model="group.chunk"
                label="Chunk"
              />
              <VuiCheckbox
                v-model="group.type"
                label="Type"
              />
              <VuiCheckbox
                v-model="group.path"
                label="Path"
              />
            </VuiFlex>
          </div>
          <div class="vui-grid vui-grid-modules vui-flex-auto" />
        </div>
        <div class="vui-pane">
          <div class="vui-filter">
            <VuiFlex spacing="10">
              <div><b>Filter:</b></div>
              <VuiInput
                v-model="keywords.assets"
                name="name"
                placeholder="Name"
                width="200px"
              />
              <div class="vui-filter-info">
                {{ assetInfo }}
              </div>
            </VuiFlex>
          </div>
          <div class="vui-grid vui-grid-assets vui-flex-auto" />
        </div>
      </template>
    </VuiTab>

    <div class="vui-footer vui-flex-row">
      <div class="vui-flex-auto">
        <b
          class="vui-link vui-module-types"
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
      <div class="vui-flex-row">
        <div class="vui-time">
          Generated {{ info.timeH }} in {{ info.durationH }}
        </div>
      </div>
    </div>
    <VuiFlyover
      ref="flyover"
      :visible="flyoverVisible"
      width="50%"
      position="right"
    >
      <div class="vui-flyover-main vui-flex-column">
        <div class="vui-flyover-header">
          <VuiFlex spacing="10">
            <div
              class="vui-flyover-icon"
              @click="flyoverVisible=false"
            >
              <div class="vui-icon vui-icon-arrow-right" />
            </div>
            <div class="vui-flyover-title vui-flex-auto">
              Module Detail
            </div>
            <div
              class="vui-flyover-icon"
              @click="flyoverVisible=false"
            >
              <div class="vui-icon vui-icon-close" />
            </div>
          </VuiFlex>
        </div>
        <div class="vui-flyover-content vui-flex-auto">
          <ModuleDetail :row-data="flyoverData" />
        </div>
      </div>
    </VuiFlyover>
  </div>
</template>
<script>
import decompress from 'lz-utils/lib/decompress.js';
import Util from './util/util.js';
import ModuleDetail from './components/module-detail.vue';
import ModalModuleTypes from './components/modal-module-types.vue';
import ModalInfo from './components/modal-info.vue';

import { components, createComponent } from 'vine-ui';
const {
    VuiCheckbox,
    VuiInput,
    VuiFlex,
    VuiModal,
    VuiFlyover,
    VuiTab
} = components;
//console.log(components);

const mixins = [];
const context = require.context('./mixin', true, /\.js$/);
const paths = context.keys();
paths.forEach((path) => {
    mixins.push(context(path).default);
});


const App = {

    createComponent,

    components: {
        VuiFlex,
        VuiCheckbox,
        VuiInput,
        VuiFlyover,
        VuiTab,
        ModuleDetail
    },

    mixins: mixins,

    data() {
        return {
            info: {},

            tabActive: 0,
            tabName: 'modules',

            group: {
                chunk: false,
                type: false,
                path: false
            },

            keywords: {
                modules: '',
                assets: ''
            },

            summary: {
                modulesNum: 0,
                modulesSize: 0,
                assetsNum: 0,
                assetsSize: 0
            },

            flyoverVisible: false,
            //flyoverMaximize: false,
            flyoverData: null
        };
    },

    computed: {
        moduleInfo() {
            return `Found ${this.summary.modulesNum} modules (${this.summary.modulesSize})`;
        },
        assetInfo() {
            return `Found ${this.summary.assetsNum} assets (${this.summary.assetsSize})`;
        }
    },

    watch: {
        tabActive: function() {
            if (this.tabActive === 1) {
                this.tabName = 'assets';
            } else {
                this.tabName = 'modules';
            }
            this.switchGrid();
        },
        group: {
            deep: true,
            handler: function() {
                this.saveStore();
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
        const statsData = JSON.parse(decompress(window.statsData));
        this.statsData = Util.initStatsData(statsData);
        console.log('statsData', this.statsData);

        //keep grid instance for modules and assets
        this.gridMap = {};

        this.initInfo();
        //after info
        this.initStore();

        window.addEventListener('resize', (e) => {
            this.resizeGrid();
        });

    },

    mounted() {
        this.renderGrid();
    },

    methods: {

        initStore() {
            Object.keys(this.group).forEach((k) => {
                this.group[k] = Boolean(Util.store.get(k));
            });
        },

        saveStore() {
            Object.keys(this.group).forEach((k) => {
                Util.store.set(k, this.group[k] ? 1 : '');
            });
        },

        initInfo() {
            this.info = {
                ... this.statsData.info,
                title: this.statsData.title
            };

            if (this.info.warnings.length > 0) {
                this.info.warningsClass = 'vui-link vui-info-warnings';
            } else {
                this.info.warningsClass = 'vui-info-disabled';
            }
            if (this.info.errors.length > 0) {
                this.info.errorsClass = 'vui-link vui-info-errors';
            } else {
                this.info.errorsClass = 'vui-info-disabled';
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
            VuiModal.createComponent({
                title: 'Module Types Definition'
            }, (h) => {
                return {
                    default: () => {
                        return h(ModalModuleTypes, {
                            moduleTypes: this.statsData.info.moduleTypes
                        });
                    }
                };
            });
        },

        showInfo(title, list) {
            if (!list || !list.length) {
                return;
            }
            VuiModal.createComponent({
                title: title
            }, (h) => {
                return {
                    default: () => {
                        return h(ModalInfo, {
                            list: list
                        });
                    }
                };
            });
        }

    }

};

export default App;
</script>
<style lang="scss" src="./app.scss"></style>
