const os = require("os");
const fs = require("fs");
const path = require("path");
const Util = require("./util.js");
const defaultOptions = require("./options.js");

const getModules = function(stats) {
    if (!stats.modules) {
        return;
    }

    //const map = new Map();


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

    return modules;
};

const getStatsData = (o, stats) => {
    const modules = getModules(stats);

    const rows = [{
        id: "assets",
        name: "Assets",
        collapsed: true,
        subs: stats.assets
    }, {
        id: "chunks",
        name: "Chunks",
        collapsed: true,
        subs: stats.chunks
    }, {
        id: "modules",
        name: "Modules",
        subs: modules
    }];
    
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