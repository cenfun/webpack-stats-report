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

            if (!this.grid) {
                this.grid = this.createGrid();
            }

            const gridData = {
                columns: this.getGridColumns(),
                rows: this.getGridRows(key)
            };

            this.grid.setOption(this.getGridOption());
            this.grid.setData(gridData);
            this.grid.render();

        },

        updateGridNameWidth() {
            if (!this.grid) {
                return;
            }

            let width = 0;
            this.columns.forEach(item => {
                if (item.id === "name") {
                    return;
                }
                width += item.width;
            });
            const totalWidth = $(".lui-grid").width();
            const w = totalWidth - width - this.grid.getScrollBarWidth();
            if (w < 300) {
                return;
            }
            this.grid.setColumnWidth("name", w);
        },

        createGrid() {
            const grid = new Grid(".lui-grid");
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

            grid.bind("onRowExpanded", function(e, d) {
                self.updateGridNameWidth();
            });

            grid.bind("onResize", function(e, d) {
                self.updateGridNameWidth();
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
                rowNotFound: "No Results",
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
                sizeFormat: function(v, rd, cd) {
                    v = Util.BF(v);
                    return this.option.stringFormat(v, rd, cd);
                },
                percentFormat: function(v) {
                    if (!v) {
                        return "";
                    }
                    return `
                    <div class="lui-percent lui-flex-row">
                        <div class="lui-percent-label">${v}%</div>
                        <div class="lui-percent-chart lui-flex-auto">
                            <div style="width:${v}%;"></div>
                        </div>
                    </div>
                    `;
                }
            };

        },

        updateGridColumns() {
            if (!this.grid) {
                return;
            }
            if (this.size.minified) {
                this.grid.showColumn("sizeMinified");
            } else {
                this.grid.hideColumn("sizeMinified");
            }
            if (this.size.gzip) {
                this.grid.showColumn("sizeGzip");
            } else {
                this.grid.hideColumn("sizeGzip");
            }
            this.updateGridNameWidth();
        },

        getGridColumns() {
            if (this.columns) {
                return this.columns;
            }

            this.columns = [{
                id: "name",
                name: "Name",
                maxWidth: 2048
            }, {
                id: "percent",
                name: "",
                sortable: false,
                dataType: "percent",
                align: "right",
                minWidth: 173,
                width: 173
            }, {
                id: "size",
                name: "Size",
                align: "right",
                dataType: "size",
                width: 80
            }, {
                id: "sizeMinified",
                name: "Minified",
                align: "right",
                dataType: "size",
                originalWidth: 80,
                width: this.size.minified ? 80 : 0
            }, {
                id: "sizeGzip",
                name: "Gzip",
                align: "right",
                dataType: "size",
                originalWidth: 80,
                width: this.size.gzip ? 80 : 0
            }, {
                id: "type",
                name: "Type",
                align: "center",
                width: 65
            }, {
                id: "chunk",
                name: "Chunk",
                width: 65,
                maxWidth: 1024
            }, {
                id: "asset",
                name: "Asset",
                width: 50,
                maxWidth: 1024
            }, {
                id: "depth",
                name: "Depth",
                align: "center",
                width: 48
            }];

            return this.columns;
        }
    }

};