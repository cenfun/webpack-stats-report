const os = require("os");
const fs = require("fs");
const path = require("path");

const micromatch = require("micromatch");
const ConsoleGrid = require("console-grid");

const Util = require("./util.js");
const defaultOptions = require("./options.js");

const initAssets = function(stats, rows) {
    if (!stats.assets) {
        return;
    }

    const assets = {
        id: "assets",
        name: "Assets",
        unsorted: true
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

    if (subs.length > 2) {
        assets.collapsed = true;
    }

    assets.subs = subs;

    rows.push(assets);

};

//=================================================================================================================

const initChunks = function(stats, rows) {
    if (!stats.chunks) {
        return;
    }

    const chunks = {
        id: "chunks",
        name: "Chunks",
        unsorted: true
    };

    const subs = stats.chunks.map(item => {
        return {
            name: item.id,
            size: item.size
        };
    });

    const totalSize = subs.reduce((prev, item) => prev + item.size, 0);
    chunks.size = totalSize;

    if (subs.length > 2) {
        chunks.collapsed = true;
    }

    chunks.subs = subs;

    rows.push(chunks);
};

//=================================================================================================================

const isMatch = function(name, patterns) {
    patterns = Util.toList(patterns);
    if (!patterns.length) {
        return true;
    }

    const format = str => str.replace(/^\.+\//, "");
    const matched = micromatch.isMatch(name, patterns, {
        format
    });
    //console.log(name, patterns, matched);
    if (matched) {
        return true;
    }
    
    return false;
};

const getModuleType = function(name, sourceMatch) {
    if (name.indexOf("external") === 0) {
        return "external";
    }
    if (name.indexOf("node_modules") !== -1) {
        if (isMatch(name, "**/node_modules/*-loader/**")) {
            return "loader";
        }
        if (isMatch(name, "**/node_modules/webpack/**")) {
            return "buildin";
        }
        return "module";
    }
    if (isMatch(name, sourceMatch)) {
        return "source";
    }
    return "unknown";
};

const initNameColor = function(item, sourceMode) {
    const colorMap = {
        app: {
            external: "orange",
            unknown: "orange"
        },
        component: {
            external: "gray",
            buildin: "orange",
            module: "red",
            unknown: "orange"
        }
    };
    const colorType = colorMap[sourceMode] || colorMap.component;
    const color = colorType[item.type];
    if (color) {
        item.name_color = color;
    }
};

const initSizeColor = function(item, sizeIfGT) {
    if (item.size > sizeIfGT.error) {
        item.size_color = "red";
        return;
    }
    if (item.size > sizeIfGT.warn) {
        item.size_color = "orange";
    }
};

const getIssuerPath = function(item, map) {
    let issuerPath = [];
    if (item.issuerPath) {
        issuerPath = item.issuerPath.map(i => {
            return i.name;
        }).reverse();
    }
    return issuerPath;
};

const initModules = function(stats, rows, o) {
    if (!stats.modules) {
        return;
    }

    const modules = {
        id: "modules",
        name: "Modules",
        unsorted: true
    };

    const map = new Map();

    const sourceMatch = Util.toList(o.sourceMatch);

    const subs = stats.modules.map(item => {

        const m = {
            name: item.name,
            size: item.size,
            chunk: item.chunks.join(","),
            asset: item.assets.join(","),
            depth: item.depth
        };
        
        //name type
        m.type = getModuleType(m.name, sourceMatch);

        //color name
        initNameColor(m, o.sourceMode);

        //short name

        //color size
        initSizeColor(m, o.sizeIfGT);

        m.issuerPath = getIssuerPath(item, map);

        return m;
    });

    const totalSize = subs.reduce((prev, item) => prev + item.size, 0);
    modules.size = totalSize;

    modules.subs = subs;

    rows.push(modules);
};

//=================================================================================================================

const getStatsData = (o, stats) => {
    const rows = [];
    initAssets(stats, rows);
    initChunks(stats, rows);
    initModules(stats, rows, o);

    const timestamp = new Date().getTime();
    const statsData = {
        timestamp: timestamp,
        title: o.title,
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