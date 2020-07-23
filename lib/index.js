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

const generateStatsReport = (option) => {

    const defaultOption = {
        stats: null,
        output: "stats-report.html",
        title: "Stats Report",
        colorSize: {
            red: 500 * 1024,
            orange: 200 * 1024
        }
    };
    option = Object.assign(defaultOption, option);

    //fix html ext
    if (path.extname(option.output) !== ".html") {
        option.output += ".html";
    }

    //create output dir
    // if (!fs.existsSync(option.output)) {
    //     fs.mkdirSync(option.output, {
    //         recursive: true
    //     });
    // }

    const stats = option.stats;
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

        return {
            name: m.name,
            size: m.size,
            chunk: m.chunks.join(","),
            asset: m.assets.join(","),
            depth: m.depth,
            issuerPath: issuerPath
        };
    });
    
    const htmlPath = path.resolve(__dirname, "./index.html");
    let html = readFileContentSync(htmlPath);

    const scriptPath = path.resolve(__dirname, "../dist/webpack-stats-report.js");
    const scriptContent = readFileContentSync(scriptPath);
    
    const timestamp = new Date().getTime();
    const statsData = {
        timestamp: timestamp,
        title: option.title,
        colorSize: option.colorSize,
        modules: modules
    };

    const content = `<script>window.statsData=${JSON.stringify(statsData)};${os.EOL}${scriptContent}</script>`;
    html = replace(html, {
        title: option.title,
        content: content
    });

    fs.writeFileSync(option.output, html);

};

module.exports = generateStatsReport;