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

const initAssets = function(stats, map, o) {
    const assets = {
        id: "assets",
        name: "Assets",
        unsorted: true
    };
    const subs = stats.assets.map(item => {
        const nameId = getMapId(item.name, map);
        const chunkId = getMapId(item.chunks.join(","), map);
        const a = {
            name: nameId,
            size: item.size,
            chunk: chunkId
        };
        const ext = path.extname(item.name);
        if (ext === ".map") {
            a.name_color = "gray";
            a.size_color = "gray";
        } else if (ext === ".js") {
            initSizeColor(a, o.overSizeColors);
        }
        return a;
    });
    const totalSize = subs.reduce((prev, item) => prev + item.size, 0);
    assets.size = totalSize;
    if (subs.length > 2) {
        assets.collapsed = true;
    }
    assets.subs = subs;
    
    return assets;
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

const initModuleTypes = function(m, moduleTypes) {
    const name = m.name;
    for (const type in moduleTypes) {
        const item = moduleTypes[type];
        const patterns = item.patterns;
        if (patterns && Util.isMatch(name, patterns)) {
            m.type = type;
            m.name_color = item.color;
            m.type_color = item.color;
            return;
        }
    }
    m.type = "other";
    m.name_color = moduleTypes.other.color;
    m.type_color = moduleTypes.other.color;
};

const initSizeColor = function(item, overSizeColors = {}) {
    for (const color in overSizeColors) {
        const size = overSizeColors[color];
        if (item.size > size) {
            item.size_color = color;
            return;
        }
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

const initModules = function(stats, map, o) {
    const modules = {
        id: "modules",
        name: "Modules",
        unsorted: true
    };
    const subs = stats.modules.map(item => {
        const chunkId = getMapId(item.chunks.join(","), map);
        const assetId = getMapId(item.assets.join(","), map);
        const m = {
            name: item.name,
            size: item.size,
            chunk: chunkId,
            asset: assetId,
            depth: item.depth,
            issuerPath: item.issuerPath
        };

        initNameLoaders(m);
        initModuleTypes(m, o.moduleTypes);
        initIssuerPath(m, map);

        //name map finally
        m.name = getMapId(m.name, map);

        initSizeColor(m, o.overSizeColors);

        return m;
    });

    const totalSize = subs.reduce((prev, item) => prev + item.size, 0);
    modules.size = totalSize;
    modules.subs = subs;
    
    return modules;
};

const initInfo = function(stats, o) {

    const info = {
        moduleTypes: o.moduleTypes,
        errors: stats.errors,
        warnings: stats.warnings,
        version: stats.version,
        timestamp: new Date().getTime()
    };

    if (stats.builtAt) {
        info.timestamp = stats.builtAt;
    }
    
    return info;
};

//=================================================================================================================

const getStatsData = (o, stats) => {

    const map = new Map();
    const statsData = {
        title: o.title,
        assets: initAssets(stats, map, o),
        modules: initModules(stats, map, o),
        info: initInfo(stats, o)
    };
    //map to object id/name
    const obj = {};
    map.forEach(function(id, name) {
        obj[id] = name;
    });
    statsData.map = obj;
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
        return o;
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