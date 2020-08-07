import { Grid, $ } from "turbogrid";
import Popup from "./popup.js";
import Util from "./util.js";

export default {
    data() {
        return {
            info: {},
            treeView: false,
            groupBy: "",
            groups: {
                assets: true,
                chunks: true,
                modules: true
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
        groupBy: function() {
            this.renderGrid();
        },
        treeView: function() {
            this.renderGrid();
        },
        groups: {
            deep: true,
            handler: function() {
                this.updateGrid();
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
        this.initGridRows();
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
            let gid = rowData.id;
            if (rowData.tg_parent) {
                gid = rowData.tg_parent.id;
            }
            if (!this.groups[gid]) {
                return false;
            }
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
            
            let rows = this.rows;
            if (this.treeView) {
                rows = this.treeViewRows;
            }

            const gridData = {
                columns: this.columns,
                rows: rows
            };

            this.grid.setData(gridData);
            this.grid.render();

        },

        createGrid() {

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
                formatter: "percent",
                width: 100
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

            grid.bind("onRenderComplete", function() {
                //bindEvents();
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

            grid.setFormatter({
                percent: function(v, rd) {
                    if (!rd.tg_parent) {
                        return "";
                    }
                    const p = (rd.size / rd.tg_parent.size * 100).toFixed(2);
                    return `<div class="gui-percent" title="${p}%"><div style="width:${p}%;"></div></div>`;
                }
            });

            grid.setOption({
                bindWindowResize: true,
                textSelectable: true,
                rowHeight: 27,
                sortField: "size",
                sortAsc: false,
                sortOnInit: true,
                collapseAll: null,
                rowNumberType: "list",
                rowFilter: function(rowData) {
                    return self.filterHandler(rowData);
                },
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
                }
            });

            return grid;

        },

        initGridRows() {
            this.rows = [this.statsData.assets, this.statsData.chunks, this.statsData.modules];
            this.treeViewRows = [this.statsData.modules];

            if (this.groupBy === "type") {

            } else if (this.groupBy === "chunk") {

            } else {

            }

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

