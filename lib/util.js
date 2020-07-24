const fs = require("fs");

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
    }
};

module.exports = Util;