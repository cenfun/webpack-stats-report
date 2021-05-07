const fs = require("fs");
const micromatch = require("micromatch");

const Util = {

    replace: function(str, obj, defaultValue) {
        str = `${str}`;
        if (!obj) {
            return str;
        }
        str = str.replace(/\[([^\]]+)\]/g, function(match, key) {
            if (!obj.hasOwnProperty(key)) {
                if (typeof defaultValue !== "undefined") {
                    return defaultValue;
                }
                return match;
            }
            let val = obj[key];
            if (typeof val === "undefined") {
                val = "";
            }
            return val;
        });
        return str;
    },
    
    readFileContentSync: function(filePath) {
        let content = null;
        const isExists = fs.existsSync(filePath);
        if (isExists) {
            content = fs.readFileSync(filePath);
            if (Buffer.isBuffer(content)) {
                content = content.toString("utf8");
            }
        }
        return content;
    },
    
    mergeOption: function(... args) {
        const option = {};
        args.forEach(item => {
            if (!item) {
                return;
            }
            Object.keys(item).forEach(k => {
                const nv = item[k];
                if (option.hasOwnProperty(k)) {
                    const ov = option[k];
                    if (ov && typeof ov === "object") {
                        if (nv && typeof nv === "object" && !Array.isArray(nv)) {
                            option[k] = Util.mergeOption(ov, nv);
                            return;
                        }
                    }
                }
                option[k] = nv;
            });
        });
        return option;
    },

    isNum: function(num) {
        if (typeof(num) !== "number" || isNaN(num)) {
            return false;
        }
        const isInvalid = function(n) {
            if (n === Number.MAX_VALUE || n === Number.MIN_VALUE || n === Number.NEGATIVE_INFINITY || n === Number.POSITIVE_INFINITY) {
                return true;
            }
            return false;
        };
        if (isInvalid(num)) {
            return false;
        }
        return true;
    },

    toNum: function(num, toInt) {
        if (typeof(num) !== "number") {
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

    toList: function(data, separator) {
        if (data instanceof Array) {
            return data;
        }
        if (typeof(data) === "string" && (typeof(separator) === "string" || separator instanceof RegExp)) {
            return data.split(separator);
        }
        if (typeof(data) === "undefined" || data === null) {
            return [];
        }
        return [data];
    },

    isMatch: function(name, patterns) {
        patterns = Util.toList(patterns);
        if (!patterns.length) {
            return true;
        }
        const format = str => str.replace(/^\.+/, "");
        const matched = micromatch.isMatch(name, patterns, {
            format
        });
        //console.log(name, patterns, matched);
        if (matched) {
            return true;
        }
        return false;
    }
};

module.exports = Util;