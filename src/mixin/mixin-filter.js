import Util from '../util/util.js';

export default {

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
                const list = this.keywords[field].trim().toLowerCase().split(/\s+/g).filter((item) => item);
                if (!list.length) {
                    continue;
                }
                const v = rowData[field];
                if (typeof v === 'undefined') {
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

        forEachModule(list, callback) {
            if (!list) {
                return;
            }
            list.forEach((item) => {
                if (!item.subs && !item.tg_hidden) {
                    callback(item);
                }
                this.forEachModule(item.subs, callback);
            });
        },

        updateFilterInfo() {
            if (this.tabName !== 'modules') {
                return;
            }

            const grid = this.getTabGrid();
            if (!grid) {
                return;
            }

            let len = 0;
            let size = 0;

            //do not repeat visible subs, filter has parent rows
            const rows = grid.getGridRowsData().filter((it) => !it.tg_parent);
            //console.log(rows.length, rows);
            this.forEachModule(rows, (row) => {
                size += row.size;
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

            //console.log(this.filterSize);
        }
    }


};
