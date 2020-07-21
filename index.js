const os = require("os");
const fs = require("fs");
const path = require("path");

const statsJson = require("./stats.json");

const getEOL = function(content) {
    if (!content) {
        return os.EOL;
    }
    const nIndex = content.lastIndexOf("\n");
    if (nIndex === -1) {
        return os.EOL;
    }
    if (content.substr(nIndex - 1, 1) === "\r") {
        return "\r\n";
    }
    return "\n";
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

const writeFileContentSync = function(filePath, content, force) {
    const isExists = fs.existsSync(filePath);
    if (force || isExists) {
        fs.writeFileSync(filePath, content);
        return true;
    }
    return false;
};

const getDeps = function() {
    return ["node_modules/turbogrid/dist/turbogrid.js"].map(item => {
        const str = readFileContentSync(item);
        if (str) {
            //str = str.replace("//# sourceMappingURL=turbogrid.min.js.map", "");
        }
        return str;
    }).join("\n");
};


const main = () => {
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

    fs.writeFileSync("./modules.json", JSON.stringify(modules, null, 4));
    
    const tempPath = path.resolve(__dirname, "./template.html");
    let html = readFileContentSync(tempPath);

    let jsStr = getDeps();

    const date = new Date().toLocaleDateString();

    const statsData = {
        date: date,
        modules: modules
    };

    jsStr += `\nthis.statsData = ${JSON.stringify(statsData)};`;

    /*inject:start*/
    /*inject:end*/
    const scriptBlock = /(([ \t]*)\/\*\s*inject:start\s*\*\/)(\r|\n|.)*?(\/\*\s*inject:end\s*\*\/)/gi;
    const hasScriptBlock = scriptBlock.test(html);
    if (hasScriptBlock) {
        const EOL = getEOL();
        html = html.replace(scriptBlock, function(match) {
            const list = [arguments[1]].concat(jsStr).concat(arguments[4]);
            const str = list.join(EOL + arguments[2]);
            return str;
        });
    }

    const htmlPath = "stats-report.html";
    writeFileContentSync(htmlPath, html, true);

};

main();