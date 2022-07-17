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
import { Grid } from 'turbogrid';
import { components } from 'vine-ui';
import decompress from 'lz-utils/lib/decompress.js';
import Util from './util/util.js';
import ModuleDetail from './components/module-detail.vue';
import ModalModuleTypes from './components/modal-module-types.vue';
import ModalInfo from './components/modal-info.vue';
import {
    onMounted, reactive, computed, watch, ref
} from 'vue';

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

const data = reactive({

    tabName: 'modules',

    flyoverVisible: false,
    //flyoverMaximize: false,
    flyoverData: null
});

const keywords = reactive({
    modules: '',
    assets: ''
});

const group = reactive({
    chunk: false,
    type: false,
    path: false
});

const summary = reactive({
    modulesNum: 0,
    modulesSize: 0,
    assetsNum: 0,
    assetsSize: 0
});

const moduleInfo = computed(() => {
    return `Found ${summary.modulesNum} modules (${summary.modulesSize})`;
});

const assetInfo = computed(() => {
    return `Found ${summary.assetsNum} assets (${summary.assetsSize})`;
});

const statsData = Util.initStatsData(JSON.parse(decompress(window.statsData)));
console.log('statsData', statsData);

//keep grid instance for modules and assets
const gridMap = {};
let previousKey;
let gridRowsCache;


const info = reactive({
    ... statsData.info,
    title: statsData.title
});

const initInfo = () => {

    if (info.warnings.length > 0) {
        info.warningsClass = 'vui-link vui-info-warnings';
    } else {
        info.warningsClass = 'vui-info-disabled';
    }
    if (info.errors.length > 0) {
        info.errorsClass = 'vui-link vui-info-errors';
    } else {
        info.errorsClass = 'vui-info-disabled';
    }
    info.timeH = new Date(info.timestamp).toLocaleString();
    info.durationH = Util.TF(info.duration, 's', 2);
};

initInfo();


const initStore = () => {
    Object.keys(group).forEach((k) => {
        group[k] = Boolean(Util.store.get(k));
    });
};

const saveStore = () => {
    Object.keys(group).forEach((k) => {
        Util.store.set(k, group[k] ? 1 : '');
    });
};

//after info
initStore();


//==================================================================================================


const generateGridRows = () => {

    if (data.tabName === 'assets') {
        return getAssetsRows();
    }

    return getModulesRows();

};

const getAssetsRows = () => {
    const assets = statsData.assets;

    const rows = assets.subs.map((sub) => {
        return {
            ... sub,
            percent: (sub.size / assets.size * 100).toFixed(2)
        };
    });

    return rows;
};

const getModulesRows = () => {
    const modules = {
        ... statsData.modules
    };
    let list = [modules];
    const g = group;
    if (g.chunk) {
        list = groupModulesByChunk(list);
    }

    if (g.type) {
        list = groupModulesByType(list);
    }

    if (g.path) {
        groupModulesByPath(list);
    }

    //final handler size and percent
    const initSize = function(parent, sizeId) {
        if (parent.subs) {
            let size = 0;
            parent.subs.forEach((sub) => {
                initSize(sub, sizeId);
                const n = sub[sizeId] || 0;
                size += n;
            });
            parent[sizeId] = size;
        }
    };
    initSize(modules, 'size');

    if (info.gzipSize) {
        initSize(modules, 'sizeGzip');
    }

    const initPercent = function(parent) {
        if (parent.subs) {
            const len = parent.subs.length;
            parent.subs.forEach((sub) => {
                if (len > 1) {
                    sub.percent = (sub.size / parent.size * 100).toFixed(2);
                }
                initPercent(sub);
            });

        }
    };
    initPercent(modules);

    //only need subs
    const rows = modules.subs;

    return rows;
};

const groupModulesByChunk = (list) => {
    let newList = [];
    list.forEach((item) => {

        const chunks = {};
        item.subs.forEach((sub) => {
            const chunkName = sub.chunk;
            let chunk = chunks[chunkName];
            if (!chunk) {
                chunk = {
                    name: chunkName,
                    chunk: chunkName,
                    collapsed: true,
                    subs: []
                };
                chunks[chunkName] = chunk;
            }
            chunk.subs.push({
                ... sub
            });
        });

        item.subs = Object.keys(chunks).map((k) => chunks[k]);

        newList = newList.concat(item.subs);

    });

    return newList;
};

const groupModulesByType = (list) => {
    let newList = [];
    const moduleTypes = statsData.info.moduleTypes;
    list.forEach((item) => {

        const types = {};
        item.subs.forEach((sub) => {
            const typeName = sub.type;
            let type = types[typeName];
            if (!type) {
                type = {
                    name: typeName,
                    chunk: sub.chunk,
                    type: typeName,
                    collapsed: true,
                    subs: []
                };
                item.collapsed = false;
                //color
                const o = moduleTypes[typeName];
                if (o && o.color) {
                    type.name_color = o.color;
                    type.type_color = o.color;
                }

                types[typeName] = type;
            }
            type.subs.push({
                ... sub
            });
        });

        item.subs = Object.keys(types).map((k) => types[k]);

        newList = newList.concat(item.subs);

    });

    return newList;
};

const groupModulesByPath = (list) => {

    list.forEach((item) => {

        const path = item;
        path.collapsed = false;
        path.map = {};
        path.files = [];

        path.subs.forEach((m) => {
            const arr = m.name.split(/\/+/g);
            const paths = arr.filter((n) => {
                //maybe need ../
                if (!n || n === '.' || n === '..') {
                    return false;
                }
                return true;
            });
            const filename = paths.pop();
            let parent = path;
            paths.forEach((p) => {
                let sub = parent.map[p];
                if (!sub) {
                    sub = {
                        name: p,
                        collapsed: true,
                        map: {},
                        files: []
                    };
                    parent.map[p] = sub;
                }
                parent = sub;
            });
            parent.files.push({
                ... m,
                name: filename
            });
        });

        const initSubs = function(parent) {
            const map = parent.map;
            const subs = Object.keys(map).map((k) => map[k]);
            delete parent.map;

            parent.subs = subs.concat(parent.files);
            delete parent.files;

            if (!parent.subs.length) {
                delete parent.subs;
            }

            if (subs.length) {
                subs.forEach((it) => {
                    initSubs(it);
                });
            }
        };
        initSubs(path);

    });

};

const getTabGrid = () => {
    return gridMap[data.tabName];
};

const resizeGrid = () => {
    const grid = getTabGrid();
    if (grid) {
        grid.resize();
    }
};

const switchGrid = () => {
    const grid = getTabGrid();
    if (grid) {
        grid.resize();
        return;
    }
    renderGrid();
};

//default grid is modules grid
const updateGrid = () => {
    const grid = getTabGrid();
    if (grid) {
        grid.update();
    }
};

const renderGrid = () => {

    const key = getRowsKey();
    if (previousKey === key) {
        return;
    }
    previousKey = key;

    let grid = getTabGrid();
    if (!grid) {
        grid = createGrid();
    }

    const gridData = {
        columns: getGridColumns(),
        rows: getGridRows(key)
    };

    console.log('gridData', key, gridData);

    grid.setData(gridData);
    grid.render();

};

const createGrid = () => {

    const grid = new Grid(`.vui-grid-${data.tabName}`);

    gridMap[data.tabName] = grid;

    if (data.tabName === 'modules') {
        grid.bind('onClick', (e, d) => {
            if (!d.rowNode) {
                return;
            }
            const rowItem = d.rowItem;

            let openFlyover = false;
            const icon = d.e.target;
            if (icon.classList.contains('tg-flyover-icon')) {
                openFlyover = true;
            }
            showFlyover(rowItem, openFlyover);

            grid.setRowSelected(rowItem, d.e);

        });

        grid.bind('onDblClick', (e, d) => {
            if (!d.rowNode) {
                return;
            }
            const rowItem = d.rowItem;
            showFlyover(rowItem, true);
        });

    }

    grid.bind('onUpdated', () => {
        updateFilterInfo();
    });

    grid.setOption({
        textSelectable: true,
        //frozenRow: 0,
        rowHeight: 27,
        sortField: 'size',
        sortAsc: false,
        sortOnInit: true,
        selectMultiple: false,
        rowNumberVisible: true,
        rowNumberWidth: 50,
        rowNotFound: '<div>No Results</div>',
        rowFilter: filterHandler
    });

    const getAllSubModules = (item) => {
        let len = 0;
        forEachModule(grid, item.subs, () => {
            len += 1;
        });
        return len;
    };

    grid.setFormatter({

        string: function(v, rd, cd) {
            const id = cd.id;
            const color = rd[`${id}_color`];
            if (color) {
                v = `<span style="color:${color};">${v}</span>`;
            }
            return v;
        },

        tree: function(v, rd, cd, node) {
            const df = this.getDefaultFormatter('tree');

            const nm = rd.name_matched;
            if (nm) {
                const left = v.substring(0, nm.index);
                const mid = v.substr(nm.index, nm.length);
                const right = v.substr(nm.index + nm.length);
                v = `${left}<b class="color-match">${mid}</b>${right}`;
            }

            if (rd.loaders) {
                v = `❁${v}`;
            }

            const sl = getAllSubModules(rd);
            if (sl > 1) {
                v += ` (${sl.toLocaleString()})`;
            }

            if (rd.name_color) {
                v = `<span style="color:${rd.name_color};">${v}</span>`;
            }

            if (rd.paths) {
                v += `
                            <div class="tg-cell-hover-icon tg-flyover-icon" title="Click to show module detail">
                                <div class="tg-issuer-icon" />
                            </div>
                        `;
            }
            return df(v, rd, cd, node);
        },

        size: function(v, rd, cd) {
            v = Util.BF(v);
            return this.getFormatter('string')(v, rd, cd);
        },

        percent: function(v) {
            if (!v) {
                return '';
            }
            return `${v}%`;
        },
        percentBar: function(v) {
            if (!v) {
                return '';
            }
            return `
                    <div class="vui-percent" style="background:linear-gradient(to right, #999 ${v}%, #fff ${v}%);"></div>
                    `;
        }
    });

    return grid;

};

const getRowsKey = () => {
    let gs = [];
    if (data.tabName === 'modules') {
        const g = {
            ... group
        };

        gs = Object.keys(g).map((k) => `${k}_${g[k]}`);
    }
    const ls = [data.tabName].concat(gs);
    return ls.join('_');
};

const getGridRows = (key) => {

    if (!gridRowsCache) {
        gridRowsCache = {};
    }

    const cacheRows = gridRowsCache[key];
    if (cacheRows) {
        return cacheRows;
    }

    const rows = generateGridRows();
    gridRowsCache[key] = rows;
    return rows;

};

const getGridColumns = () => {
    //update every time for invisible
    const columns = [{
        id: 'name',
        name: 'Name',
        width: 500,
        maxWidth: 2048
    }, {
        id: 'percent',
        name: 'Percent',
        formatter: 'percent',
        sortable: false,
        align: 'right'
    }, {
        id: 'percent',
        name: '',
        sortable: false,
        formatter: 'percentBar',
        width: 112
    }, {
        id: 'size',
        name: 'Size',
        align: 'right',
        formatter: 'size',
        width: 80
    }, {
        id: 'sizeGzip',
        name: 'Gzip',
        align: 'right',
        formatter: 'size',
        invisible: !info.gzipSize,
        width: 80
    }, {
        id: 'chunk',
        name: 'Chunk',
        width: 65,
        maxWidth: 1024
    }, {
        id: 'type',
        name: 'Type',
        invisible: data.tabName !== 'modules',
        width: 65
    }, {
        id: 'depth',
        name: 'Depth',
        align: 'right',
        invisible: data.tabName !== 'modules',
        width: 52
    }];

    return columns;
};

const isMatch = (value, list, rowData, matchedKey) => {
    for (let i = 0, l = list.length; i < l; i++) {
        const k = list[i];
        const index = value.indexOf(k);
        if (index !== -1) {
            rowData[matchedKey] = {
                index: index,
                length: k.length
            };
            return true;
        }
    }
    return false;
};

const filterHandler = (rowData) => {
    const matchedKey = 'name_matched';
    rowData[matchedKey] = null;

    const ks = keywords[data.tabName];
    if (!ks) {
        return true;
    }

    const list = ks.trim().toLowerCase().split(/\s+/g).filter((item) => item);
    if (!list.length) {
        return true;
    }
    const v = rowData.name;
    if (typeof v === 'undefined') {
        return false;
    }
    const value = `${v}`.toLowerCase();
    if (isMatch(value, list, rowData, matchedKey)) {
        return true;
    }

    return false;

};

const forEachModule = (grid, list, callback) => {
    if (!grid || !list) {
        return;
    }
    list.forEach((item) => {
        if (grid.isInvisible(item)) {
            return;
        }
        if (item.subs) {
            forEachModule(grid, item.subs, callback);
        } else {
            callback(item);
        }
    });
};

const updateFilterInfo = () => {

    const grid = getTabGrid();
    if (!grid) {
        return;
    }

    let num = 0;
    let size = 0;

    const rows = grid.rows;
    forEachModule(grid, rows, (row) => {
        size += row.size;
        num += 1;
    });

    if (data.tabName === 'modules') {
        summary.modulesNum = num;
        summary.modulesSize = `${Util.BF(size)}`;
    } else {
        summary.assetsNum = num;
        summary.assetsSize = `${Util.BF(size)}`;
    }

};

const showFlyover = (rowData, force) => {

    if (!data.flyoverVisible && !force) {
        return;
    }

    data.flyoverVisible = true;

    rowData.sizeH = Util.BF(rowData.size);
    data.flyoverData = rowData;

};

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
        data.tabName = 'assets';
    } else {
        data.tabName = 'modules';
    }
    switchGrid();
});

watch(group, () => {
    saveStore();
    renderGrid();
});

watch(keywords, () => {
    updateGrid();
});

onMounted(() => {
    renderGrid();
});

window.addEventListener('resize', (e) => {
    resizeGrid();
});

</script>
<style lang="scss" src="./app.scss"></style>
