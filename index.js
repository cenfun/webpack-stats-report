const os = require("os");
const fs = require("fs");
const path = require("path");

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

const getDeps = function() {
    return ["turbogrid/dist/turbogrid.js"].map(item => {
        let p = path.resolve(__dirname, "./node_modules/", item);
        if (!fs.existsSync(p)) {
            p = path.resolve(__dirname, "../", item);
        }
        const str = readFileContentSync(item) || "";
        return str;
    }).join(os.EOL);
};

const getStatsJson = (option) => {
    if (option.statsJson) {
        return option.statsJson;
    }

    if (fs.existsSync(option.statsPath)) {
        return require(option.statsPath);
    }
};


const generateStatsReport = (option) => {

    const defaultOption = {
        statsPath: "stats.json",
        statsJson: null,
        outputPath: "./.temp/",
        outputFilename: "stats-report.html"
    };
    option = Object.assign(defaultOption, option);

    //create dir
    if (!fs.existsSync(option.outputPath)) {
        fs.mkdirSync(option.outputPath, {
            recursive: true
        });
    }
    
    if (path.extname(option.outputFilename) !== ".html") {
        option.outputFilename += ".html";
    }

    const statsJson = getStatsJson(option);
    if (!statsJson) {
        console.log("Not found stats, please pass statsJson or statsPath");
        return;
    }

    const modules = statsJson.modules.map(m => {
        let issuerPath = [];
        if (m.issuerPath) {
            issuerPath = m.issuerPath.map(i => {
                return i.name;
            }).reverse();
        }
        return {
            name: m.name,
            size: m.size,
            chunks: m.chunks.join(","),
            assets: m.assets.join(","),
            depth: m.depth,
            issuerPath: issuerPath
        };
    });
    
    const tempPath = path.resolve(__dirname, "./template.html");
    let html = readFileContentSync(tempPath);

    let jsStr = getDeps();

    const date = new Date().toLocaleDateString();

    const statsData = {
        date: date,
        modules: modules
    };

    jsStr += `${os.EOL}this.statsData = ${JSON.stringify(statsData)};`;

    /*inject:start*/
    /*inject:end*/
    const scriptBlock = /(([ \t]*)\/\*\s*inject:start\s*\*\/)(\r|\n|.)*?(\/\*\s*inject:end\s*\*\/)/gi;
    const hasScriptBlock = scriptBlock.test(html);
    if (hasScriptBlock) {
        const EOL = os.EOL;
        html = html.replace(scriptBlock, function(match) {
            const list = [arguments[1]].concat(jsStr).concat(arguments[4]);
            const str = list.join(EOL + arguments[2]);
            return str;
        });
    }

    const htmlPath = path.resolve(option.outputPath, option.outputFilename);
    fs.writeFileSync(htmlPath, html);

};

export default generateStatsReport;