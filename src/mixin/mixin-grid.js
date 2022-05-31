import { Grid } from 'turbogrid';
import Util from '../util/util.js';

export default {

    methods: {

        getTabGrid() {
            return this.gridMap[this.tabName];
        },

        resizeGrid() {
            const grid = this.getTabGrid();
            if (grid) {
                grid.resize();
            }
        },

        switchGrid() {
            const grid = this.getTabGrid();
            if (grid) {
                grid.resize();
                return;
            }
            this.renderGrid();
        },

        //default grid is modules grid
        updateGrid() {
            const grid = this.getTabGrid();
            if (grid) {
                grid.update();
            }
        },

        renderGrid() {

            const key = this.getRowsKey();
            if (this.previousKey === key) {
                return;
            }
            this.previousKey = key;

            let grid = this.getTabGrid();
            if (!grid) {
                grid = this.createGrid();
            }

            const gridData = {
                columns: this.getGridColumns(),
                rows: this.getGridRows(key)
            };

            console.log('gridData', key, gridData);

            grid.setData(gridData);
            grid.render();

        },

        createGrid() {

            const grid = new Grid(`.vui-grid-${this.tabName}`);

            this.gridMap[this.tabName] = grid;

            if (this.tabName === 'modules') {
                grid.bind('onClick', (e, d) => {
                    const rowData = grid.getRowItem(d.row);

                    let openFlyover = false;
                    const icon = d.e.target;
                    if (icon.classList.contains('tg-flyover-icon')) {
                        openFlyover = true;
                    }
                    this.showFlyover(rowData, openFlyover);

                    grid.unselectAll();
                    grid.setSelectedRow(d.row, d.e);

                });

                grid.bind('onDblClick', (e, d) => {
                    const rowData = grid.getRowItem(d.row);
                    this.showFlyover(rowData, true);
                });

            }

            grid.bind('onRenderUpdate', () => {
                this.updateFilterInfo();
            });

            grid.setOption({
                textSelectable: true,
                //frozenRow: 0,
                rowHeight: 27,
                sortField: 'size',
                sortAsc: false,
                sortOnInit: true,
                collapseAll: null,
                rowNumberType: 'list',
                rowNotFound: '<div>No Results</div>',
                rowFilter: this.filterHandler
            });

            const getAllSubModules = (item) => {
                let len = 0;
                this.forEachModule(grid, item.subs, () => {
                    len += 1;
                });
                return len;
            };

            grid.setFilter({

                string: function(v, rd, cd) {
                    const id = cd.id;
                    const color = rd[`${id}_color`];
                    if (color) {
                        v = `<span style="color:${color};">${v}</span>`;
                    }
                    return v;
                },

                tree: function(v, rd, cd, ri, ci, node) {
                    const nm = rd.name_matched;
                    if (nm) {
                        const left = v.substring(0, nm.index);
                        const mid = v.substr(nm.index, nm.length);
                        const right = v.substr(nm.index + nm.length);
                        v = `${left}<b class="color-match">${mid}</b>${right}`;
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
                    return v;
                },

                size: function(v, rd, cd) {
                    v = Util.BF(v);
                    return this.getFilter('string')(v, rd, cd);
                },

                percent: function(v) {
                    if (!v) {
                        return '';
                    }
                    return `
                    <div class="vui-percent vui-flex-row">
                        <div class="vui-percent-label">${v}%</div>
                        <div class="vui-percent-chart vui-flex-auto" style="background:linear-gradient(to right, #999 ${v}%, #fff ${v}%);"></div>
                    </div>
                    `;
                }
            });

            return grid;

        },

        getRowsKey() {
            let gs = [];
            if (this.tabName === 'modules') {
                const g = {
                    ... this.group
                };

                gs = Object.keys(g).map((k) => `${k}_${g[k]}`);
            }
            const ls = [this.tabName].concat(gs);
            return ls.join('_');
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

        getGridColumns() {
            //update every time for invisible
            const columns = [{
                id: 'name',
                name: 'Name',
                width: 500,
                maxWidth: 2048
            }, {
                id: 'percent',
                name: '',
                sortable: false,
                dataType: 'percent',
                align: 'right',
                minWidth: 173,
                width: 173
            }, {
                id: 'size',
                name: 'Size',
                align: 'right',
                dataType: 'size',
                width: 80
            }, {
                id: 'sizeGzip',
                name: 'Gzip',
                align: 'right',
                dataType: 'size',
                invisible: !this.info.gzipSize,
                width: 80
            }, {
                id: 'chunk',
                name: 'Chunk',
                width: 65,
                maxWidth: 1024
            }, {
                id: 'type',
                name: 'Type',
                align: 'center',
                invisible: this.tabName !== 'modules',
                width: 65
            }, {
                id: 'depth',
                name: 'Depth',
                align: 'center',
                invisible: this.tabName !== 'modules',
                width: 52
            }];

            return columns;
        }

    }

};
