const os = require("os");
const fs = require("fs");
const path = require("path");

const Util = require("./util.js");
const defaultOptions = require("./options.js");

const getMapId = function(name, map) {
    if (typeof name === "undefined") {
        return name;
    }
    if (map.has(name)) {
        return map.get(name);
    }
    const id = `${map.size + 1}`;
    map.set(name, id);
    return id;
};

const initAssets = function(stats, rows, map) {
    if (!stats.assets) {
        return;
    }
    const assets = {
        id: "assets",
        name: "Assets",
        unsorted: true
    };
    const subs = stats.assets.map(item => {
        const name = getMapId(item.name, map);
        const chunk = getMapId(item.chunks.join(","), map);
        return {
            name: name,
            size: item.size,
            chunk: chunk
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

const initChunks = function(stats, rows, map) {
    if (!stats.chunks) {
        return;
    }
    const chunks = {
        id: "chunks",
        name: "Chunks",
        unsorted: true
    };
    const subs = stats.chunks.map(item => {
        const name = getMapId(item.id, map);
        return {
            name: name,
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

const initNameLoaders = function(item) {
    const name = item.name;
    const list = (`${name}`).split("!");
    const file = list.pop();
    if (file !== name) {
        item.fullName = name;
    }
    item.name = file;
    if (!list.length) {
        return;
    }
    item.loaders = list.map(loader => {
        const left = loader.split("-loader/").shift();
        const right = left.split("/").pop();
        return right;
    });
};

const initModuleType = function(m, typePatterns) {
    const name = m.name;
    let finalType = "other";
    for (const type in typePatterns) {
        if (Util.isMatch(name, typePatterns[type])) {
            finalType = type;
            break;
        }
    }
    m.type = finalType;
};

const initNameColor = function(item, typeMode, typeColors) {
    const colorType = typeColors[typeMode] || typeColors.component;
    const color = colorType[item.type];
    if (color) {
        item.name_color = color;
        item.type_color = color;
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

const initIssuerPath = function(item, map) {
    if (!item.issuerPath) {
        item.issuerPath = [];
        return;
    }
    const shortName = item.name.split("?").shift();
    const set = new Set();
    item.issuerPath.forEach(ip => {
        const name = ip.name;
        const list = (`${name}`).split("!");
        //remove args after ? for path, useless for path
        const last = list.pop();
        const file = last.split("?").shift();
        if (file !== shortName) {
            set.add(file);
        }
    });
    item.issuerPath = Array.from(set).map(p => {
        return getMapId(p, map);
    }).reverse();
};

const initModules = function(stats, rows, map, o) {
    if (!stats.modules) {
        return;
    }

    const modules = {
        id: "modules",
        name: "Modules",
        unsorted: true
    };

    const subs = stats.modules.map(item => {

        const chunk = getMapId(item.chunks.join(","), map);
        const asset = getMapId(item.assets.join(","), map);
        const m = {
            name: item.name,
            size: item.size,
            chunk: chunk,
            asset: asset,
            depth: item.depth,
            issuerPath: item.issuerPath
        };

        initNameLoaders(m);
        initModuleType(m, o.typePatterns);
        initNameColor(m, o.typeMode, o.typeColors);
        initSizeColor(m, o.sizeIfGT);
        initIssuerPath(m, map);

        //name map finally
        m.name = getMapId(m.name, map);

        return m;
    });

    const totalSize = subs.reduce((prev, item) => prev + item.size, 0);
    modules.size = totalSize;
    modules.subs = subs;

    rows.push(modules);
};

//=================================================================================================================

const getStatsData = (o, stats) => {
    const map = new Map();
    const rows = [];
    initAssets(stats, rows, map);
    initChunks(stats, rows, map);
    initModules(stats, rows, map, o);

    //map to object id/name
    const obj = {};
    map.forEach(function(id, name) {
        obj[id] = name;
    });

    const timestamp = new Date().getTime();
    const statsData = {
        timestamp: timestamp,
        title: o.title,
        rows: rows,
        map: obj
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
        console.log("ERROR: Invalid stats");
        return;
    }

    if (typeof stats.toJson === "function") {
        stats = stats.toJson(o.toJsonOptions);
    }

    const statsData = getStatsData(o, stats);
    o.statsData = statsData;

    const scriptPath = path.resolve(__dirname, "../dist/webpack-stats-report.js");
    const scriptContent = Util.readFileContentSync(scriptPath);
    const content = `<script>window.statsData=${JSON.stringify(statsData)};${os.EOL}${scriptContent}</script>`;

    const htmlPath = path.resolve(__dirname, "./template.html");
    let html = Util.readFileContentSync(htmlPath);
    html = Util.replace(html, {
        title: o.title,
        content: content
    });
    o.html = html;

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