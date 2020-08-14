const os = require("os");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const Terser = require("terser");
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

const initTypeAndColor = function(m, moduleTypes) {
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

const initSizeColor = function(item, overSizeColors = {}, sizeId = "size") {
    for (const color in overSizeColors) {
        const overSize = overSizeColors[color];
        const size = item[sizeId];
        if (size > overSize) {
            item[`${sizeId}_color`] = color;
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

const generateMinifiedSize = async (source, m) => {
    
    //Terser do not support json
    const ext = path.extname(m.name);
    if (ext === ".json") {
        return source;
    }

    //try minified only for js
    const options = {
        output: {
            comments: false
        }
    };
    
    let done = true;
    const result = await Terser.minify(source, options).catch(function(e) {
        console.log(`failed to minify: ${m.name}`);
        done = false;
    });

    if (done) {
        source = result.code;
        m.sizeMinified = source.length;
    }

    return source;
};

const generateGzipSize = (source, m) => {
    //try gzip
    let gzip;
    try {
        gzip = zlib.gzipSync(source, {
            level: 9
        });
    } catch (e) {
        console.log(`failed to gzip: ${m.name}`);
    }

    if (gzip) {
        m.sizeGzip = gzip.length;
    }
};

const generateModuleSize = async (m) => {

    //default to size 
    m.sizeMinified = m.size;
    m.sizeGzip = m.size;

    let source = m.source;
    //if no source someone especial
    if (!source) {
        return;
    }

    source = await generateMinifiedSize(source, m);
    generateGzipSize(source, m);

};

const generateModulesSize = async (statsModules, o) => {

    const hasSource = statsModules.find(item => item.source);
    if (!hasSource) {
        return;
    }

    const total = statsModules.length;
    if (!total) {
        return;
    }

    let time_start = Date.now();
    let index = 1;
    for (const m of statsModules) {
        const now = Date.now();
        if (now - time_start > 3000) {
            time_start = now;
            const per = (index / total * 100).toFixed(2);
            console.log(`Generating minified/gzip size from source: ${index}/${total} - ${per}%`);
        }
        await generateModuleSize(m);
        index += 1;
    }

    o.info.hasMinifiedAndGzipSize = true;
    
};

const initModules = async (stats, map, o) => {

    //init source size first
    if (o.generateMinifiedAndGzipSize) {
        await generateModulesSize(stats.modules, o);
    }

    const modules = {
        id: "modules",
        name: "Modules",
        unsorted: true
    };

    const subs = stats.modules.map((item) => {

        //name
        const m = {
            name: item.name
        };
        initNameLoaders(m);
        initTypeAndColor(m, o.moduleTypes);

        //size
        m.size = item.size;
        initSizeColor(m, o.overSizeColors);
        if (o.info.hasMinifiedAndGzipSize) {
            m.sizeMinified = item.sizeMinified;
            initSizeColor(m, o.overSizeColors, "sizeMinified");
            m.sizeGzip = item.sizeGzip;
            initSizeColor(m, o.overSizeColors, "sizeGzip");
        }

        //other
        const chunkId = getMapId(item.chunks.join(","), map);
        const assetId = getMapId(item.assets.join(","), map);
        Object.assign(m, {
            chunk: chunkId,
            asset: assetId,
            depth: item.depth,
            issuerPath: item.issuerPath
        });
        initIssuerPath(m, map);

        //name map finally
        m.name = getMapId(m.name, map);
        
        return m;
    });

    modules.size = subs.reduce((prev, item) => prev + item.size, 0);
    if (o.info.hasMinifiedAndGzipSize) {
        modules.sizeMinified = subs.reduce((prev, item) => prev + item.sizeMinified, 0);
        modules.sizeGzip = subs.reduce((prev, item) => prev + item.sizeGzip, 0);
    }

    modules.subs = subs;
    
    return modules;
};

const initInfo = function(o, stats) {
    let timestamp = new Date().getTime();
    if (stats.builtAt) {
        timestamp = stats.builtAt;
    }

    o.info = {
        hasMinifiedAndGzipSize: false,
        moduleTypes: o.moduleTypes,
        errors: stats.errors,
        warnings: stats.warnings,
        version: stats.version,
        timestamp: timestamp
    };

};

const initModuleTypes = (o) => {
    //sort by priority
    const ot = o.moduleTypes;
    const arr = Object.keys(ot).map(k => {
        const item = ot[k];
        item.type = k;
        return item;
    }).sort(function(a, b) {
        return a.priority - b.priority;
    });
    const nt = {};
    arr.forEach(item => {
        nt[item.type] = item;
    });
    o.moduleTypes = nt;
};

//=================================================================================================================

const getStatsData = async (o, stats) => {

    initModuleTypes(o);
    initInfo(o, stats);

    const map = new Map();
    const statsData = {
        title: o.title,
        assets: initAssets(stats, map, o),
        modules: await initModules(stats, map, o),
        info: o.info
    };
    //map to object id/name
    const obj = {};
    map.forEach(function(id, name) {
        obj[id] = name;
    });
    statsData.map = obj;
    return statsData;
};

const StatsReportGenerator = async (options = {}) => {

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

    const statsData = await getStatsData(o, stats);
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