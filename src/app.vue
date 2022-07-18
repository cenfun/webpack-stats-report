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
        <VuiFlex spacing="10px">
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
            <VuiFlex spacing="10px">
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
              <div><b>Group by:</b></div>
              <VuiSwitch
                v-model="group.chunk"
                label="Chunk"
              />
              <VuiSwitch
                v-model="group.type"
                label="Type"
              />
              <VuiSwitch
                v-model="group.path"
                label="Path"
              />
            </VuiFlex>
          </div>
          <div class="vui-grid vui-grid-modules vui-flex-auto" />
        </div>
        <div class="vui-pane">
          <div class="vui-filter">
            <VuiFlex spacing="10px">
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
      :visible="data.flyoverVisible"
      width="50%"
      position="right"
    >
      <div class="vui-flyover-main vui-flex-column">
        <div class="vui-flyover-header">
          <VuiFlex spacing="10px">
            <div
              class="vui-flyover-icon"
              @click="data.flyoverVisible=false"
            >
              <div class="vui-icon vui-icon-arrow-right" />
            </div>
            <div class="vui-flyover-title vui-flex-auto">
              Module Detail
            </div>
            <div
              class="vui-flyover-icon"
              @click="data.flyoverVisible=false"
            >
              <div class="vui-icon vui-icon-close" />
            </div>
          </VuiFlex>
        </div>
        <div class="vui-flyover-content vui-flex-auto">
          <ModuleDetail :row-data="data.flyoverData" />
        </div>
      </div>
    </VuiFlyover>
  </div>
</template>
<script setup>
import {
    onMounted, watch, computed, ref
} from 'vue';

import { components } from 'vine-ui';

import ModalModuleTypes from './components/modal-module-types.vue';
import ModalInfo from './components/modal-info.vue';
import ModuleDetail from './components/module-detail.vue';

import store from './util/store.js';

import {
    statsData, data, info, group, summary, keywords,
    switchGrid, renderGrid, updateGrid, resizeGrid
} from './grid.js';

//console.log(components);

const {
    VuiInput,
    VuiFlex,
    VuiModal,
    VuiFlyover,
    VuiSwitch,
    VuiTab
} = components;

const tabActive = ref(0);


const moduleInfo = computed(() => {
    return `Found ${summary.modulesNum} modules (${summary.modulesSize})`;
});

const assetInfo = computed(() => {
    return `Found ${summary.assetsNum} assets (${summary.assetsSize})`;
});


//==================================================================================================

const showModuleTypes = () => {
    VuiModal.createComponent({
        title: 'Module Types Definition'
    }, (h) => {
        return {
            default: () => {
                return h(ModalModuleTypes, {
                    moduleTypes: statsData.info.moduleTypes
                });
            }
        };
    });
};

const showInfo = (title, list) => {
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
};

//==================================================================================================

watch(tabActive, () => {
    if (tabActive.value === 1) {
        data.gridName = 'assets';
    } else {
        data.gridName = 'modules';
    }
    switchGrid(data.gridName);
});

watch(group, () => {
    Object.keys(group).forEach((k) => {
        store.set(k, group[k] ? 1 : '');
    });
    renderGrid(data.gridName);
});

watch(keywords, () => {
    updateGrid(data.gridName);
});

onMounted(() => {
    renderGrid(data.gridName);
});

window.addEventListener('resize', (e) => {
    resizeGrid(data.gridName);
});


</script>
<style lang="scss" src="./app.scss"></style>
