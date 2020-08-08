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
