const os = require('os');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const Terser = require('terser');
const compress = require('lz-utils/lib/compress.js');
const Util = require('./util.js');
const defaultOptions = require('./options.js');

const getMapId = function(name, map) {
    if (typeof name === 'undefined') {
        return name;
    }
    if (map.has(name)) {
        return map.get(name);
    }
    const id = `${map.size + 1}`;
    map.set(name, id);
    return id;
};

//=================================================================================================================
//minify and gzip size

const generateMinifiedSize = async (source, item) => {

    //Terser do not support json
    const ext = path.extname(item.name);
    if (ext === '.json') {
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
        console.log(`failed to minify: ${item.name}`);
        done = false;
    });

    if (done) {
        source = result.code;
        item.sizeMinified = source.length;
    }

    return source;
};

const generateGzipSize = (source, item) => {
    //try gzip
    let gzip;
    try {
        gzip = zlib.gzipSync(source, {
            level: 9
        });
    } catch (e) {
        console.log(`failed to gzip: ${item.name}`);
    }

    if (gzip) {
        item.sizeGzip = gzip.length;
    }
};

const generateSourceSize = async (item) => {

    let source = item.source;
    //if no source someone especial
    if (!source) {
        return;
    }

    source = await generateMinifiedSize(source, item);
    generateGzipSize(source, item);

};

const generateListSize = async (list, o) => {

    const hasSource = list.find((item) => item.source);
    if (!hasSource) {
        return;
    }

    const total = list.length;
    if (!total) {
        return;
    }

    let time_start = Date.now();
    let index = 1;
    for (const m of list) {
        const now = Date.now();
        if (now - time_start > 3000) {
            time_start = now;
            const per = (index / total * 100).toFixed(2);
            console.log(`Generating minified/gzip size from source: ${index}/${total} - ${per}%`);
        }
        await generateSourceSize(m);
        index += 1;
    }

};

//=================================================================================================================

const generateTotalSize = (group, o) => {
    const subs = group.subs;
    group.size = subs.reduce((prev, item) => {
        let v = prev;
        if (Util.isNum(item.size)) {
            v += item.size;
        }
        return v;
    }, 0);

    const hasMinifiedAndGzipSize = subs.find((item) => Util.isNum(item.sizeMinified));
    if (!hasMinifiedAndGzipSize) {
        return;
    }

    o.info.hasMinifiedAndGzipSize = true;

};

//=================================================================================================================

const initAssets = async (stats, map, o) => {

    if (o.generateMinifiedAndGzipSize) {
        //add source for assets first
        const outputPath = stats.outputPath;
        stats.assets.forEach((item) => {
            const assetPath = path.resolve(outputPath, item.name);
            if (fs.existsSync(assetPath)) {
                const buf = fs.readFileSync(assetPath);
                if (buf) {
                    item.source = buf.toString();
                }
            }
        });

        await generateListSize(stats.assets, o);

        //remove source
        stats.assets.forEach((item) => {
            if (item.source) {
                delete item.source;
            }
        });
    }

    const subs = stats.assets.map((item) => {
        const nameId = getMapId(item.name, map);
        const chunkId = getMapId(item.chunks.join(','), map);
        const a = {
            name: nameId,
            size: item.size,
            sizeMinified: item.sizeMinified,
            sizeGzip: item.sizeGzip,
            chunk: chunkId
        };
        const ext = path.extname(item.name);
        if (ext === '.map') {
            a.name_color = 'gray';
            a.size_color = 'gray';
        } else if (ext === '.js') {
            initSizeColor(a, o.overSizeColors);
            initSizeColor(a, o.overSizeColors, 'sizeMinified');
            initSizeColor(a, o.overSizeColors, 'sizeGzip');
        }
        return a;
    });

    const assets = {
        id: 'assets',
        name: 'Assets',
        subs: subs,
        unsorted: true
    };

    generateTotalSize(assets, o);

    if (subs.length > 2) {
        assets.collapsed = true;
    }

    return assets;
};

//=================================================================================================================

const initNameLoaders = function(item) {
    const name = item.name;
    const list = (`${name}`).split('!');
    const file = list.pop();
    if (file !== name) {
        item.fullName = name;
    }
    item.name = file;
    if (!list.length) {
        return;
    }
    item.loaders = list.map((loader) => {
        const left = loader.split('-loader/').shift();
        return left.split('/').pop();
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
    m.type = 'other';
    m.name_color = moduleTypes.other.color;
    m.type_color = moduleTypes.other.color;
};

const initSizeColor = function(item, overSizeColors = {}, sizeId = 'size') {
    for (const color in overSizeColors) {
        const overSize = overSizeColors[color];
        const size = item[sizeId];
        if (Util.isNum(size) && size > overSize) {
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
    const shortName = item.name.split('?').shift();
    const set = new Set();
    item.issuerPath.forEach((ip) => {
        const name = ip.name;
        const list = (`${name}`).split('!');
        //remove args after ? for path, useless for path
        const last = list.pop();
        const file = last.split('?').shift();
        if (file !== shortName) {
            set.add(file);
        }
    });
    item.issuerPath = Array.from(set).map((p) => {
        return getMapId(p, map);
    }).reverse();
};

//=================================================================================================================

const initModules = async (stats, map, o) => {

    //init source size first
    if (o.generateMinifiedAndGzipSize) {
        await generateListSize(stats.modules, o);
    }

    const subs = stats.modules.map((item) => {

        //name
        const m = {
            name: item.name,
            size: item.size,
            sizeMinified: item.sizeMinified,
            sizeGzip: item.sizeGzip
        };
        initNameLoaders(m);
        initTypeAndColor(m, o.moduleTypes);

        //size color
        initSizeColor(m, o.overSizeColors);
        initSizeColor(m, o.overSizeColors, 'sizeMinified');
        initSizeColor(m, o.overSizeColors, 'sizeGzip');

        //other
        const chunkId = getMapId(item.chunks.join(','), map);
        const assetId = getMapId(item.assets.join(','), map);
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

    const modules = {
        id: 'modules',
        name: 'Modules',
        subs: subs,
        unsorted: true
    };

    generateTotalSize(modules, o);

    return modules;
};

//=================================================================================================================

const initInfo = function(o, stats) {

    // console.log(Object.keys(stats));
    // console.log('stats.builtAt', stats.builtAt);
    // console.log('stats.time', stats.time);

    o.info = {
        hasMinifiedAndGzipSize: false,
        moduleTypes: o.moduleTypes,

        timestamp: stats.builtAt,
        // Compilation time in milliseconds
        duration: stats.time,

        // Version of webpack used for the compilation
        version: stats.version,

        // Compilation specific hash
        hash: stats.hash,

        publicPath: stats.publicPath,
        outputPath: stats.outputPath,


        errors: stats.errors,
        warnings: stats.warnings
    };

};

const initModuleTypes = (o) => {
    //sort by priority
    const ot = o.moduleTypes;
    const arr = Object.keys(ot).map((k) => {
        const item = ot[k];
        item.type = k;
        return item;
    }).sort(function(a, b) {
        return a.priority - b.priority;
    });
    const nt = {};
    arr.forEach((item) => {
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
        assets: await initAssets(stats, map, o),
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
    if (path.extname(o.output) !== '.html') {
        o.output += '.html';
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
        console.log('ERROR: Invalid stats');
        return o;
    }

    if (typeof stats.toJson === 'function') {
        stats = stats.toJson(o.toJsonOptions);
    }

    const statsData = await getStatsData(o, stats);
    o.statsData = statsData;

    const list = ['<script>'];

    const statsDataStr = compress(JSON.stringify(statsData));
    list.push(`window.statsData='${statsDataStr}';`);

    //add vue dist
    // const vuePath = path.resolve(__dirname, '../node_modules/vue/dist/vue.runtime.global.js');
    // const vueContent = Util.readFileContentSync(vuePath);
    // list.push(vueContent);

    const scriptPath = path.resolve(__dirname, '../dist/webpack-stats-report.js');
    const scriptContent = Util.readFileContentSync(scriptPath);
    list.push(scriptContent);

    list.push('</script>');

    const content = list.join(os.EOL);

    const htmlPath = path.resolve(__dirname, './template.html');
    let html = Util.readFileContentSync(htmlPath);
    html = Util.replace(html, {
        'placeholder-title': o.title,
        'placeholder-content': content
    });
    o.html = html;

    //save html
    fs.writeFileSync(o.output, html);

    //save json
    if (o.outputStatsJson) {
        const statsJson = JSON.stringify(stats, null, 4);
        o.outputJsonPath = `${o.output.substr(0, o.output.length - 5)}.json`;
        fs.writeFileSync(o.outputJsonPath, statsJson);
    }

    return o;
};

module.exports = StatsReportGenerator;
