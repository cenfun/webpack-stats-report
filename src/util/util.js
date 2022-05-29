const Util = {
    toNum: function(num, toInt) {
        if (typeof (num) !== 'number') {
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

    zero: function(s, l = 2) {
        s = `${s}`;
        return s.padStart(l, '0');
    },

    isList: function(data) {
        if (data && data instanceof Array && data.length > 0) {
            return true;
        }
        return false;
    },

    toList: function(data) {
        if (typeof (data) === 'undefined') {
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
            return '0B';
        }
        let prefix = '';
        if (v < 0) {
            v = Math.abs(v);
            prefix = '-';
        }
        const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
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

    TF: function(v, unit, digits = 1) {
        v = Util.toNum(v, true);
        if (unit) {
            if (unit === 's') {
                v = (v / 1000).toFixed(digits);
            } else if (unit === 'm') {
                v = (v / 1000 / 60).toFixed(digits);
            } else if (unit === 'h') {
                v = (v / 1000 / 60 / 60).toFixed(digits);
            }
            return Util.NF(v) + unit;
        }
        const s = v / 1000;
        const hours = Math.floor(s / 60 / 60);
        const minutes = Math.floor((s - (hours * 60 * 60)) / 60);
        const seconds = Math.round(s - (hours * 60 * 60) - (minutes * 60));
        return `${hours}:${Util.zero(minutes)}:${Util.zero(seconds)}`;
    },

    NF: function(v) {
        v = Util.toNum(v);
        return v.toLocaleString();
    },

    store: {
        key(k) {
            return `wsr_${k}`;
        },
        get(k, dv = '') {
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

        const setMap = (list) => {
            if (!Util.isList(list)) {
                return;
            }
            list.forEach((item) => {
                item.name = map[item.name];
                //fullName
                if (item.chunk) {
                    item.chunk = map[item.chunk];
                }
                if (item.asset) {
                    item.asset = map[item.asset];
                }
                if (item.issuerPath) {
                    item.issuerPath = item.issuerPath.map((p) => {
                        return map[p];
                    });
                }
                setMap(item.subs);
            });
        };

        [statsData.assets, statsData.modules].forEach((am) => {
            setMap(am.subs);
        });

        return statsData;
    }
};

export default Util;
