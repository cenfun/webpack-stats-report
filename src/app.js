import { Grid, $ } from "turbogrid";
import Popup from "./popup.js";
import Util from "./util.js";

export default {
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
        this.initGridColumns();
        this.initInfo();
    },

    mounted() {
        this.renderGrid();
    },

    methods: {

        isMatch(value, list, rowData, matchedKey) {
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
        },
        
        filterHandler(rowData) {
            for (const field in this.keywords) {
                const matchedKey = `${field}_matched`;
                rowData[matchedKey] = null;
                const list = this.keywords[field].trim().toLowerCase().split(/\s+/g).filter(item => item);
                if (!list.length) {
                    continue;
                }
                const v = rowData[field];
                if (typeof v === "undefined") {
                    return false;
                }
                const value = `${v}`.toLowerCase();
                if (this.isMatch(value, list, rowData, matchedKey)) {
                    continue;
                }
                return false;
            }
            return true;
        },

        updateFilterInfo() {
            let len = 0;
            let size = 0;
            const rows = this.grid.getGridRowsData();
            rows.forEach(item => {
                if (!item.tg_parent) {
                    return;
                }
                if (item.tg_parent.id !== "modules") {
                    return;
                }
                size += item.size;
                len += 1;
            });

            const totalModulesSize = this.statsData.modules.size;
            const totalModulesLength = this.statsData.modules.subs.length;
        
            let sizeStr = `${Util.BF(size)}`;
            if (len !== totalModulesLength) {
                const per = (size / totalModulesSize * 100).toFixed(2);
                sizeStr += `, ${per}%`;
            }
            this.filterModules = len;
            this.filterSize = sizeStr;
        },

        updateGrid() {
            if (this.grid) {
                this.grid.update();
            }
        },

        renderGrid() {

            if (!this.grid) {
                this.grid = this.createGrid();
            }
            
            const gridData = {
                columns: this.columns,
                rows: this.getGridRows()
            };

            this.grid.setOption(this.getGridOption());
            this.grid.setData(gridData);
            this.grid.render();

        },

        createGrid() {
            const grid = new Grid(".gui-grid");
            const self = this;
            grid.bind("onClick", function(e, d) {
                const icon = d.e.target;
                if (icon.classList.contains("tg-detail-icon")) {
                    const rowData = this.getRowItem(d.row);
                    self.showDetail(rowData);
                }
                this.unselectAll();
                this.setSelectedRow(d.row, d.e);
            });

            grid.bind("onRenderUpdate", function() {
                self.updateFilterInfo();
            });

            grid.bind("onResize", function(e, d) {
                let width = 0;
                self.columns.forEach(item => {
                    if (item.id === "name") {
                        return;
                    }
                    width += item.width;
                });
                const totalWidth = $(".gui-grid").width();
                const w = totalWidth - width - grid.getScrollBarWidth();
                grid.setColumnWidth("name", w);
            });

            return grid;

        },

        getGridRows() {

            if (!this.gridRowsCache) {
                this.gridRowsCache = {};
            }

            const g = {
                ... this.group
            };

            if (!g.modules) {
                g.type = false;
                g.chunk = false;
                g.folder = false;
            }

            const key = Object.keys(g).map(k => `${k}_${g[k]}`).join("_");

            //console.log(key);

            const cacheRows = this.gridRowsCache[key];
            if (cacheRows) {
                return cacheRows;
            }

            const rows = this.generateGridRows();
            this.gridRowsCache[key] = rows;
            return rows;

            
        },

        generateGridRows() {

            const g = this.group;

            if (!g.assets && !g.modules) {
                return [];
            }

            if (!g.modules) {
                return this.getAssetsRow().subs;
            }

            if (!g.assets) {
                return this.getModulesRow().subs;
            }
            
            return [this.getAssetsRow(), this.getModulesRow()];
        },

        getAssetsRow() {
            const assets = this.statsData.assets;
            const subs = assets.subs.map(sub => {
                return {
                    ... sub,
                    percent: (sub.size / assets.size * 100).toFixed(2)
                };
            });
            return {
                ... assets,
                subs
            };
        },

        getModulesRow() {
            const modules = {
                ... this.statsData.modules
            };
            let list = [modules];
            const g = this.group;
            if (g.chunk) {
                list = this.groupModulesByChunk(list);
            }

            if (g.type) {
                list = this.groupModulesByType(list);
            }

            if (g.folder) {
                this.groupModulesByFolder(list);
            }

            //final handler size and percent
            const initSize = function(parent) {
                if (parent.subs) {
                    let size = 0;
                    parent.subs.forEach(sub => {
                        initSize(sub);
                        size += sub.size;
                    });
                    parent.size = size;
                }
            };
            initSize(modules);

            const initPercent = function(parent) {
                if (parent.subs) {
                    const len = parent.subs.length;
                    parent.subs.forEach(sub => {
                        if (len > 1) {
                            sub.percent = (sub.size / parent.size * 100).toFixed(2);
                        }
                        initPercent(sub);
                    });
                   
                }
            };
            initPercent(modules);

            return modules;
        },

        groupModulesByChunk(list) {
            let newList = [];
            list.forEach(item => {

                const chunks = {};
                item.subs.forEach(sub => {
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

                item.subs = Object.keys(chunks).map(k => chunks[k]);

                newList = newList.concat(item.subs);
            
            });

            return newList;
        },

        groupModulesByType(list) {
            let newList = [];
            const moduleTypes = this.statsData.info.moduleTypes;
            list.forEach(item => {

                const types = {};
                item.subs.forEach(sub => {
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

                item.subs = Object.keys(types).map(k => types[k]);

                newList = newList.concat(item.subs);
            
            });

            return newList;
        },

        groupModulesByFolder(list) {

            list.forEach(item => {

                const folder = item;
                folder.collapsed = false;
                folder.map = {};
                folder.files = [];
            
                folder.subs.forEach(m => {
                    const arr = m.name.split(/\/|\\/g);
                    const paths = arr.filter(n => {
                        //maybe need ../
                        if (!n || n === "." || n === "..") {
                            return false;
                        }
                        return true;
                    });
                    const filename = paths.pop();
                    let parent = folder;
                    paths.forEach(p => {
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
                    const subs = Object.keys(map).map(k => map[k]);
                    delete parent.map;
                    
                    parent.subs = subs.concat(parent.files);
                    delete parent.files;

                    if (!parent.subs.length) {
                        delete parent.subs;
                    }

                    if (subs.length) {
                        subs.forEach(item => {
                            initSubs(item);
                        });
                    }
                };
                initSubs(folder);
            
            });

        },

        getGridOption() {
            return {
                bindWindowResize: true,
                textSelectable: true,
                rowHeight: 27,
                sortField: "size",
                sortAsc: false,
                sortOnInit: true,
                collapseAll: null,
                rowNumberType: "list",
                rowFilter: this.filterHandler,
                stringFormat: function(v, rd, cd) {
                    const id = cd.id;
                    const color = rd[`${id}_color`];
                    if (color) {
                        v = `<span style="color:${color};">${v}</span>`;
                    }
                    return v;
                },
                treeFormat: function(v, rd, cd, ri, ci, node) {
                    const nm = rd.name_matched;
                    if (nm) {
                        const left = v.substring(0, nm.index);
                        const mid = v.substr(nm.index, nm.length);
                        const right = v.substr(nm.index + nm.length);
                        v = `${left}<b class="color-match">${mid}</b>${right}`;
                    }
            
                    const sl = rd.tg_subs_length || rd.tg_s_length;
                    if (sl && sl > 1) {
                        v += ` (${sl.toLocaleString()})`;
                    }
            
                    if (rd.name_color) {
                        v = `<span style="color:${rd.name_color};">${v}</span>`;
                    }
            
                    if (rd.issuerPath) {
                        v += `
                            <div class="tg-cell-hover-icon tg-detail-icon" title="Click for Detail">
                                <div class="tg-issuer-icon" />
                            </div>
                        `;
                    }
                    return v;
                },
                sizeFormat: function(v, rowData) {
                    const s = Util.BF(v);
                    if (rowData.size_color) {
                        return `<span style="color:${rowData.size_color};">${s}</span>`;
                    }
                    return s;
                },
                percentFormat: function(v) {
                    if (!v) {
                        return "";
                    }
                    return `
                    <div class="gui-percent gui-flex-row">
                        <div class="gui-percent-label">${v}%</div>
                        <div class="gui-percent-chart gui-flex-auto">
                            <div style="width:${v}%;"></div>
                        </div>
                    </div>
                    `;
                }
            };

        },

        initGridColumns() {

            this.columns = [{
                id: "name",
                name: "Name",
                maxWidth: 2048
            }, {
                id: "size",
                name: "Size",
                align: "right",
                dataType: "size",
                width: 80
            }, {
                id: "percent",
                name: "",
                sortable: false,
                dataType: "percent",
                align: "right",
                minWidth: 173,
                width: 173
            }, {
                id: "type",
                name: "Type",
                align: "center",
                width: 65
            }, {
                id: "chunk",
                name: "Chunk",
                width: 80,
                maxWidth: 1024
            }, {
                id: "asset",
                name: "Asset",
                width: 80,
                maxWidth: 1024
            }, {
                id: "depth",
                name: "Depth",
                align: "center",
                width: 50
            }];

        },

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

        showModuleTypes() {
            this.popupModuleTypes = new Popup();
            this.popupModuleTypes.renderModuleTypes(this.statsData.info.moduleTypes);
        },
    
        showDetail(rowData) {
            this.popupDetail = new Popup();
            this.popupDetail.renderDetail(rowData);
        },
        
        showInfo(title, list, color) {
            if (!list || !list.length) {
                return;
            }
            this.popupInfo = new Popup();
            this.popupInfo.renderInfo(title, list, color);
        }
    
    }
    
};

