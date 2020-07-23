const os = require("os");
const fs = require("fs");
const path = require("path");

const replace = function(str, obj, defaultValue) {
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
};

const readFileContentSync = function(filePath) {
    let content = null;
    const isExists = fs.existsSync(filePath);
    if (isExists) {
        content = fs.readFileSync(filePath);
        if (Buffer.isBuffer(content)) {
            content = content.toString("utf8");
        }
    }
    return content;
};

const mergeOption = function(... args) {
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
                        option[k] = mergeOption(ov, nv);
                        return;
                    }
                }
            }
            option[k] = nv;
        });
    });
    return option;
};

const defaultOptions = {
    stats: null,
    output: "stats-report.html",
    title: "Stats Report",
    colorConditions: {
        redSizeGT: 500 * 1024,
        orangeSizeGT: 200 * 1024,
        redNameNotIncludes: []
    }
};

const StatsReportGenerator = (options = {}) => {

    const o = mergeOption(defaultOptions, options);

    //fix html ext
    if (path.extname(o.output) !== ".html") {
        o.output += ".html";
    }

    //create output dir
    const dir = path.dirname(o.output);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {
            recursive: true
        });
    }

    const stats = o.stats;
    if (!stats || !stats.modules) {
        console.log("Invalid stats");
        return;
    }

    const modules = stats.modules.map(m => {
        let issuerPath = [];
        if (m.issuerPath) {
            issuerPath = m.issuerPath.map(i => {
                return i.name;
            }).reverse();
        }
        //short name
        //name type: source, loader, external, asset, unknown

        return {
            name: m.name,
            size: m.size,
            chunk: m.chunks.join(","),
            asset: m.assets.join(","),
            depth: m.depth,
            issuerPath: issuerPath
        };
    });
    
    const htmlPath = path.resolve(__dirname, "./template.html");
    let html = readFileContentSync(htmlPath);

    const scriptPath = path.resolve(__dirname, "../dist/webpack-stats-report.js");
    const scriptContent = readFileContentSync(scriptPath);
    
    const timestamp = new Date().getTime();
    const statsData = {
        timestamp: timestamp,
        title: o.title,
        colorConditions: o.colorConditions,
        modules: modules
    };

    const content = `<script>window.statsData=${JSON.stringify(statsData)};${os.EOL}${scriptContent}</script>`;
    html = replace(html, {
        title: o.title,
        content: content
    });

    fs.writeFileSync(o.output, html);
    
    return o;

};

module.exports = StatsReportGenerator;