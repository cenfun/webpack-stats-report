import { Grid } from 'turbogrid';
import { TF, BF } from './util/util.js';

import store from './util/store.js';
import dataHandler from './util/data.js';

import { reactive } from 'vue';

//keep grid instance for modules and assets
const gridMap = {};
const gridRowsCache = {};
let previousKey;

export const statsData = dataHandler(window.statsData);
console.log('statsData', statsData);

export const data = reactive({

    gridName: 'modules',

    flyoverVisible: false,
    //flyoverMaximize: false,
    flyoverData: null
});


export const group = reactive({
    chunk: false,
    type: false,
    path: false
});

export const summary = reactive({
    modulesNum: 0,
    modulesSize: 0,
    assetsNum: 0,
    assetsSize: 0
});


export const info = reactive({
    ... statsData.info,
    title: statsData.title
});

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
info.durationH = TF(info.duration, 's', 2);

export const keywords = reactive({
    modules: '',
    assets: ''
});

//after info
Object.keys(group).forEach((k) => {
    group[k] = Boolean(store.get(k));
});


const generateGridRows = (gridName) => {
    if (gridName === 'modules') {
        return getModulesRows();
    }
    return getAssetsRows();
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

const createGrid = (gridName) => {

    const grid = new Grid(`.vui-grid-${gridName}`);

    if (gridName === 'modules') {
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
        updateFilterInfo(gridName);
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
        rowFilter: (rowItem) => {
            return filterHandler(rowItem, gridName);
        }
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

            if (rd.paths || rd.bailout) {
                v += `
                    <div class="tg-cell-hover-icon tg-flyover-icon" title="Click to show module detail">
                        <div class="tg-issuer-icon" />
                    </div>
                `;
            }
            return df(v, rd, cd, node);
        },

        size: function(v, rd, cd) {
            v = BF(v);
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

const getRowsKey = (gridName) => {
    let gs = [];
    if (gridName === 'modules') {
        const g = {
            ... group
        };

        gs = Object.keys(g).map((k) => `${k}_${g[k]}`);
    }
    const ls = [gridName].concat(gs);
    return ls.join('_');
};

const getGridRows = (key, gridName) => {

    const cacheRows = gridRowsCache[key];
    if (cacheRows) {
        return cacheRows;
    }

    const rows = generateGridRows(gridName);
    gridRowsCache[key] = rows;
    return rows;

};

const getGridColumns = (gridName) => {
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
        invisible: gridName !== 'modules',
        width: 65
    }, {
        id: 'depth',
        name: 'Depth',
        align: 'right',
        invisible: gridName !== 'modules',
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

const filterHandler = (rowItem, gridName) => {
    const matchedKey = 'name_matched';
    rowItem[matchedKey] = null;

    const ks = keywords[gridName];
    if (!ks) {
        return true;
    }

    const list = ks.trim().toLowerCase().split(/\s+/g).filter((item) => item);
    if (!list.length) {
        return true;
    }
    const v = rowItem.name;
    if (typeof v === 'undefined') {
        return false;
    }
    const value = `${v}`.toLowerCase();
    if (isMatch(value, list, rowItem, matchedKey)) {
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

const updateFilterInfo = (gridName) => {

    const grid = gridMap[gridName];
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

    if (gridName === 'modules') {
        summary.modulesNum = num;
        summary.modulesSize = `${BF(size)}`;
    } else {
        summary.assetsNum = num;
        summary.assetsSize = `${BF(size)}`;
    }

};

const showFlyover = (rowData, force) => {

    if (!data.flyoverVisible && !force) {
        return;
    }

    data.flyoverVisible = true;

    rowData.sizeH = BF(rowData.size);
    data.flyoverData = rowData;

};


export const resizeGrid = (gridName) => {
    const grid = gridMap[gridName];
    if (grid) {
        grid.resize();
    }
};

export const switchGrid = (gridName) => {
    const grid = gridMap[gridName];
    if (grid) {
        grid.resize();
        return;
    }
    renderGrid(gridName);
};

//default grid is modules grid
export const updateGrid = (gridName) => {
    const grid = gridMap[gridName];
    if (grid) {
        grid.update();
    }
};

export const renderGrid = (gridName) => {

    const key = getRowsKey(gridName);
    if (previousKey === key) {
        return;
    }
    previousKey = key;

    let grid = gridMap[gridName];
    if (!grid) {
        grid = createGrid(gridName);
        gridMap[gridName] = grid;
    }

    const gridData = {
        columns: getGridColumns(gridName),
        rows: getGridRows(key, gridName)
    };

    console.log('gridData', key, gridData);

    grid.setData(gridData);
    grid.render();

};
