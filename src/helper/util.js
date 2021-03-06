const Util = {
    toNum: function(num, toInt) {
        if (typeof (num) !== "number") {
            num = parseFloat(num);
        }
        if (isNaN(num)) {
            num = 0;
        }
        if (toInt) {
            num = Math.round(num);
        }
        return num;
    },

    toList: function(data) {
        if (typeof(data) === "undefined") {
            return [];
        }
        if (data instanceof Array) {
            return data;
        }
        return [data];
    },
    
    BF: function(v, digits = 1, base = 1024) {
        v = Util.toNum(v, true);
        if (v === 0) {
            return "0B";
        }
        let prefix = "";
        if (v < 0) {
            v = Math.abs(v);
            prefix = "-";
        }
        const units = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
        for (let i = 0, l = units.length; i < l; i++) {
            const min = Math.pow(base, i);
            const max = Math.pow(base, i + 1);
            if (v > min && v < max) {
                const unit = units[i];
                v = `${prefix + (v / min).toFixed(digits)} ${unit}`;
                break;
            }
        }
        return v;
    },

    store: {
        key(k) {
            return `wsr_${k}`;
        },
        get(k, dv = "") {
            k = Util.store.key(k);
            let v = null;
            try {
                v = window.localStorage.getItem(k);
            } catch (e) {
                console.log(e);
            }
            if (v === null) {
                return dv;
            }
            return v;
        },
        set(k, v) {
            k = Util.store.key(k);
            try {
                window.localStorage.setItem(k, v);
            } catch (e) {
                console.log(e);
            }
        }
    },

    initStatsData: function(statsData) {
        const map = statsData.map;
        delete statsData.map;

        [statsData.assets, statsData.modules].forEach(item => {

            item.subs.forEach(item => {
                item.name = map[item.name];
                //fullName
                if (item.chunk) {
                    item.chunk = map[item.chunk];
                }
                if (item.asset) {
                    item.asset = map[item.asset];
                }
                if (item.issuerPath) {
                    item.issuerPath = item.issuerPath.map(p => {
                        return map[p];
                    });
                }
            });

        });

        return statsData;
    }
};

export default Util;
