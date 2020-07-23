const os = require("os");
const fs = require("fs");
const path = require("path");
const Util = require("./util.js");
const defaultOptions = require("./options.js");

const getModules = function(stats) {
    if (!stats.modules) {
        return [];
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

    return modules;
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

    const stats = o.stats;
    if (!stats) {
        console.log("Invalid stats");
        return;
    }
    
    const modules = getModules(stats);
    
    const htmlPath = path.resolve(__dirname, "./template.html");
    let html = Util.readFileContentSync(htmlPath);

    const scriptPath = path.resolve(__dirname, "../dist/webpack-stats-report.js");
    const scriptContent = Util.readFileContentSync(scriptPath);
    
    const timestamp = new Date().getTime();
    const statsData = {
        timestamp: timestamp,
        title: o.title,
        colorConditions: o.colorConditions,
        modules: modules
    };

    const content = `<script>window.statsData=${JSON.stringify(statsData)};${os.EOL}${scriptContent}</script>`;
    html = Util.replace(html, {
        title: o.title,
        content: content
    });

    fs.writeFileSync(o.output, html);
    
    return o;

};

module.exports = StatsReportGenerator;