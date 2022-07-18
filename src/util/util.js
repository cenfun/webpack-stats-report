
export const toNum = function(num, toInt) {
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
};

export const zero = function(s, l = 2) {
    s = `${s}`;
    return s.padStart(l, '0');
};

export const isList = function(data) {
    if (data && data instanceof Array && data.length > 0) {
        return true;
    }
    return false;
};

export const toList = function(data) {
    if (typeof (data) === 'undefined') {
        return [];
    }
    if (data instanceof Array) {
        return data;
    }
    return [data];
};

export const BF = function(v, digits = 1, base = 1024) {
    v = toNum(v, true);
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
};

export const TF = function(v, unit, digits = 1) {
    v = toNum(v, true);
    if (unit) {
        if (unit === 's') {
            v = (v / 1000).toFixed(digits);
        } else if (unit === 'm') {
            v = (v / 1000 / 60).toFixed(digits);
        } else if (unit === 'h') {
            v = (v / 1000 / 60 / 60).toFixed(digits);
        }
        return NF(v) + unit;
    }
    const s = v / 1000;
    const hours = Math.floor(s / 60 / 60);
    const minutes = Math.floor((s - (hours * 60 * 60)) / 60);
    const seconds = Math.round(s - (hours * 60 * 60) - (minutes * 60));
    return `${hours}:${zero(minutes)}:${zero(seconds)}`;
};

export const NF = function(v) {
    v = toNum(v);
    return v.toLocaleString();
};
