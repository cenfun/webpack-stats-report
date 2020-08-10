import { Grid, $ } from "turbogrid";
import Util from "../helper/util.js";

export default {

    methods: {
        updateGrid() {
            if (this.grid) {
                this.grid.update();
            }
        },

        renderGrid() {

            const key = this.getRowsKey();
            if (this.previousKey === key) {
                return;
            }
            this.previousKey = key;

            this.saveGroup();

            if (!this.grid) {
                this.grid = this.createGrid();
            }
            
            const gridData = {
                columns: this.columns,
                rows: this.getGridRows(key)
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

        getRowsKey() {
            const g = {
                ... this.group
            };

            if (!g.modules) {
                g.type = false;
                g.chunk = false;
                g.folder = false;
            }

            return Object.keys(g).map(k => `${k}_${g[k]}`).join("_");
        },

        getGridRows(key) {

            if (!this.gridRowsCache) {
                this.gridRowsCache = {};
            }

            const cacheRows = this.gridRowsCache[key];
            if (cacheRows) {
                return cacheRows;
            }

            const rows = this.generateGridRows();
            this.gridRowsCache[key] = rows;
            return rows;

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

        }
    }

};