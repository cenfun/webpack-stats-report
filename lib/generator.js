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
        for (const k in item) {
            const v = item[k];
            if (v && typeof v === "object" && !Array.isArray(v) && option.hasOwnProperty(k)) {
                option[k] = mergeOption(option[k], v);
                return;
            }
            option[k] = v;
        }
    });
    return option;
};

const defaultOption = {
    stats: null,
    output: "stats-report.html",
    title: "Stats Report",
    colorConditions: {
        redSizeGT: 500 * 1024,
        orangeSizeGT: 200 * 1024,
        redNameNotIncludes: []
    }
};

const StatsReportGenerator = (option = {}) => {

    const o = mergeOption(defaultOption, option);

    //fix html ext
    if (path.extname(o.output) !== ".html") {
        o.output += ".html";
    }

    //create output dir
    // if (!fs.existsSync(o.output)) {
    //     fs.mkdirSync(o.output, {
    //         recursive: true
    //     });
    // }

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

};

module.exports = StatsReportGenerator;