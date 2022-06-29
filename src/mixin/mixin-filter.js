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
            const matchedKey = 'name_matched';
            rowData[matchedKey] = null;

            const keywords = this.keywords[this.tabName];
            if (!keywords) {
                return true;
            }

            const list = keywords.trim().toLowerCase().split(/\s+/g).filter((item) => item);
            if (!list.length) {
                return true;
            }
            const v = rowData.name;
            if (typeof v === 'undefined') {
                return false;
            }
            const value = `${v}`.toLowerCase();
            if (this.isMatch(value, list, rowData, matchedKey)) {
                return true;
            }

            return false;

        },

        forEachModule(grid, list, callback) {
            if (!grid || !list) {
                return;
            }
            list.forEach((item) => {
                if (grid.isInvisible(item)) {
                    return;
                }
                if (item.subs) {
                    this.forEachModule(grid, item.subs, callback);
                } else {
                    callback(item);
                }
            });
        },

        updateFilterInfo() {

            const grid = this.getTabGrid();
            if (!grid) {
                return;
            }

            let num = 0;
            let size = 0;

            const rows = grid.rows;
            this.forEachModule(grid, rows, (row) => {
                size += row.size;
                num += 1;
            });

            if (this.tabName === 'modules') {
                this.summary.modulesNum = num;
                this.summary.modulesSize = `${Util.BF(size)}`;
            } else {
                this.summary.assetsNum = num;
                this.summary.assetsSize = `${Util.BF(size)}`;
            }

        }
    }


};
