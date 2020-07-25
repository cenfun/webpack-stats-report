const os = require("os");
const fs = require("fs");
const path = require("path");
const Util = require("./util.js");
const defaultOptions = require("./options.js");

const initAssets = function(stats, rows) {
    if (!stats.assets) {
        return;
    }

    const assets = {
        id: "assets",
        name: "Assets",
        unsorted: true,
        collapsed: true
    };

    const subs = stats.assets.map(item => {
        return {
            name: item.name,
            size: item.size,
            chunk: item.chunks.join(",")
        };
    });

    const totalSize = subs.reduce((prev, item) => prev + item.size, 0);
    assets.size = totalSize;

    assets.subs = subs;

    rows.push(assets);

};

const initChunks = function(stats, rows) {
    if (!stats.chunks) {
        return;
    }

    const chunks = {
        id: "chunks",
        name: "Chunks",
        unsorted: true,
        collapsed: true
    };

    const subs = stats.chunks.map(item => {
        return {
            name: item.id,
            size: item.size
        };
    });

    const totalSize = subs.reduce((prev, item) => prev + item.size, 0);
    chunks.size = totalSize;

    chunks.subs = subs;

    rows.push(chunks);
};


const initModules = function(stats, rows) {
    if (!stats.modules) {
        return;
    }

    const modules = {
        id: "modules",
        name: "Modules",
        unsorted: true
    };

    //const map = new Map();

    const subs = stats.modules.map(item => {
        let issuerPath = [];
        if (item.issuerPath) {
            issuerPath = item.issuerPath.map(i => {
                return i.name;
            }).reverse();
        }
        //short name
        //name type: source, loader, external, asset, unknown

        return {
            name: item.name,
            size: item.size,
            chunk: item.chunks.join(","),
            asset: item.assets.join(","),
            depth: item.depth,
            issuerPath: issuerPath
        };
    });

    const totalSize = subs.reduce((prev, item) => prev + item.size, 0);
    modules.size = totalSize;

    modules.subs = subs;

    rows.push(modules);
};

const getStatsData = (o, stats) => {
    const rows = [];
    initAssets(stats, rows);
    initChunks(stats, rows);
    initModules(stats, rows);

    const timestamp = new Date().getTime();
    const statsData = {
        timestamp: timestamp,
        title: o.title,
        colorConditions: o.colorConditions,
        rows: rows
    };

    return statsData;
};

const StatsReportGenerator = (options = {}) => {

    const o = Util.mergeOption(defaultOptions, options);

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

    let stats = o.stats;
    if (!stats) {
        console.log("Invalid stats");
        return;
    }

    if (typeof stats.toJson === "function") {
        stats = stats.toJson(o.toJsonOptions);
    }

    const statsData = getStatsData(o, stats);
    const scriptPath = path.resolve(__dirname, "../dist/webpack-stats-report.js");
    const scriptContent = Util.readFileContentSync(scriptPath);
    const content = `<script>window.statsData=${JSON.stringify(statsData)};${os.EOL}${scriptContent}</script>`;

    const htmlPath = path.resolve(__dirname, "./template.html");
    let html = Util.readFileContentSync(htmlPath);
    html = Util.replace(html, {
        title: o.title,
        content: content
    });

    //save html
    fs.writeFileSync(o.output, html);

    //save json
    if (o.outputStatsJson) {
        const statsJson = JSON.stringify(stats, null, 4);
        o.outputJsonPath = `${o.output.substr(0, o.output.length - 4)}.json`;
        fs.writeFileSync(o.outputJsonPath, statsJson);
    }

    return o;
};

module.exports = StatsReportGenerator;