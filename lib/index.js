const os = require("os");
const fs = require("fs");
const path = require("path");

const replace = function(str, obj, defaultValue) {
    str = `${str}`;
    if (!obj) {
        return str;
    }
    str = str.replace(/\{([^}{]+)\}/g, function(match, key) {
        if (!obj.hasOwnProperty(key)) {
            if (typeof(defaultValue) !== "undefined") {
                return defaultValue;
            }
            return match;
        }
        let val = obj[key];
        if (typeof(val) === "function") {
            val = val(obj, key);
        }
        if (typeof(val) === "undefined") {
            val = "";
        }
        return val;
    });
    return str;
};

const isDate = function(date) {
    if (!date || !(date instanceof Date)) {
        return false;
    }
    //is Date Object but Date {Invalid Date}
    if (isNaN(date.getTime())) {
        return false;
    }
    return true;
};

const toDate = function(input) {
    if (isDate(input)) {
        return input;
    }
    //fix time zone issue by use "/" replace "-"
    const inputHandler = function(input) {
        if (typeof(input) !== "string") {
            return input;
        }
        //do NOT change ISO format: 2020-03-20T19:10:38.358Z
        if (input.indexOf("T") !== -1) {
            return input;
        }
        input = input.split("-").join("/");
        return input;
    };
    input = inputHandler(input);
    let date = new Date(input);
    if (isDate(date)) {
        return date;
    }
    date = new Date();
    return date;
};

const zero = function(s, l = 2) {
    s = `${s}`;
    return s.padStart(l, "0");
};

const DF = function(timestamp) {
    const t = toDate(timestamp);
    let d = t.getFullYear().toString();
    d += `-${zero(t.getMonth() + 1)}`;
    d += `-${zero(t.getDate())}`;
    return d;
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
        title: "Stats Report",
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
    
    const htmlPath = path.resolve(__dirname, "./index.html");
    let html = readFileContentSync(htmlPath);

    const scriptPath = path.resolve(__dirname, "../dist/webpack-stats-report.js");
    const scriptContent = readFileContentSync(scriptPath);
    

    const statsData = {
        date: DF(new Date()),
        title: option.title,
        modules: modules
    };

    const content = `<script>window.statsData=${JSON.stringify(statsData)};${os.EOL}${scriptContent}</script>`;
    html = replace(html, {
        title: option.title,
        content: content
    });

    const savePath = path.resolve(option.outputPath, option.outputFilename);
    fs.writeFileSync(savePath, html);

};

module.exports = generateStatsReport;