<template>
  <div class="vui-main">
    <div class="vui-header vui-flex-row">
      <div class="vui-title vui-flex-auto">
        {{ info.title }}
      </div>
      <div class="vui-flex-row">
        <a
          href="https://webpack.js.org/"
          target="_blank"
        >webpack v{{ info.version }}</a>
      </div>
    </div>
    <div class="vui-filter">
      <VuiFlex spacing="10">
        <VuiCheckbox v-model="group.assets">
          <b>Assets</b>
        </VuiCheckbox>
        <div class="vui-separator" />
        <VuiCheckbox v-model="group.modules">
          <b>Modules</b>
        </VuiCheckbox>
        <VuiCheckbox
          v-model="group.chunk"
          label="Chunk"
        />
        <div class="vui-arrow-next" />
        <VuiCheckbox
          v-model="group.type"
          label="Type"
        />
        <div class="vui-arrow-next" />
        <VuiCheckbox
          v-model="group.folder"
          label="Folder"
        />
        <div class="vui-flex-empty" />
      </VuiFlex>
    </div>
    <div class="vui-filter">
      <VuiFlex spacing="10">
        <div>Filter:</div>
        <VuiInput
          v-model="keywords.name"
          name="name"
          placeholder="Name"
          title="Chunk"
          width="150px"
        />
        <VuiInput
          v-model="keywords.chunk"
          name="chunk"
          placeholder="Chunk"
          title="Chunk"
        />
        <VuiInput
          v-model="keywords.type"
          name="type"
          placeholder="Type"
          title="Type"
        />
        <span
          v-if="group.modules && !hasGroup"
          class="vui-filter-info"
        >Found <b>{{ filterModules }}</b> modules ({{ filterSize }})</span>
      </VuiFlex>
    </div>
    <div class="vui-grid vui-flex-auto" />
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
          Generated {{ info.timeH }} in {{ info.durationH }} by <a
            href="https://github.com/cenfun/webpack-stats-report"
            target="_blank"
          >WSR</a>
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
              Detail
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
          <ModalDetail :row-data="flyoverData" />
        </div>
      </div>
    </VuiFlyover>
  </div>
</template>
<script>
import decompress from 'lz-utils/lib/decompress.js';
import Util from './util/util.js';
import ModalDetail from './components/modal-detail.vue';
import ModalModuleTypes from './components/modal-module-types.vue';
import ModalInfo from './components/modal-info.vue';

import { components, createComponent } from 'vine-ui';
const {
    VuiCheckbox,
    VuiInput,
    VuiFlex,
    VuiModal,
    VuiFlyover
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
            Object.keys(this.group).forEach((k) => {
                if (k === 'modules') {
                    return;
                }
                this.group[k] = Boolean(Util.store.get(k));
            });
        },

        saveStore() {
            Object.keys(this.group).forEach((k) => {
                if (k === 'modules') {
                    return;
                }
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
