import { $ } from "turbogrid";

const temp = `
<div class="gui-popup">
    <div class="gui-popup-main">
        <div class="gui-popup-header"></div>
        <div class="gui-popup-content"></div>
    </div>
    <div class="gui-popup-close">X</div>
</div>
`;

const tempDetail = `
    <div class="gui-name">
        <div class="gui-popup-label">Name:</div>
        <div class="gui-popup-item"></div>
    </div>
    <div class="gui-asset">
        <div class="gui-popup-label">Asset:</div>
        <div class="gui-popup-item"></div>
    </div>
    <div class="gui-path">
        <div class="gui-popup-label">Path:</div>
        <div class="gui-popup-list"></div>
    </div>
    <div class="gui-chunk">
        <div class="gui-popup-label">Chunk:</div>
        <div class="gui-popup-item"></div>
    </div>
`;

export default class Popup {

    constructor() {
        this.$ = $;
        this.$container = $(temp).appendTo(document.body);
        
        //close event handler
        setTimeout(() => {
            $(document).bind("click.popup", (e) => {
                if (!this.$container) {
                    return;
                }
                const $main = this.$container.find(".gui-popup-main");
                if ($main.get(0) === e.target || $main.contains(e.target)) {
                    return;
                }
                $(document).unbind("click.popup");
                this.destroy();
            });
        }, 100);
    }

    renderDetail(rowData) {
        this.$container.find(".gui-popup-header").html("Module Detail");

        this.$container.find(".gui-popup-content").html(tempDetail);

        const arrow = '<div class="gui-popup-arrow"></div>';

        const $name = this.$container.find(".gui-name");

        let name = "";
        if (rowData.loaders) {
            name += rowData.loaders.map(item => `${item}-loader -&gt; `).join("");
        }
        name += rowData.name;
        if (rowData.fullName) {
            name += `<div class="gui-popup-tip">(${rowData.fullName})</div>`;
        }
        $name.find(".gui-popup-item").html(name);

        const $asset = this.$container.find(".gui-asset");
        if (rowData.asset) {
            $asset.find(".gui-popup-item").html(rowData.asset);
        } else {
            $asset.remove();
        }

        let pathStr = rowData.issuerPath.map(item => {
            return `<div class="gui-popup-item">${arrow} ${item}</div>`;
        }).join("");

        if (!pathStr) {
            pathStr = "<div class=\"gui-popup-item\">(root)</div>";
        }
    
        const $path = this.$container.find(".gui-path");
        $path.find(".gui-popup-list").html(pathStr);
        
        const $chunk = this.$container.find(".gui-chunk");
        $chunk.find(".gui-popup-item").html(`${arrow} ${rowData.chunk}`);
    }

    renderModuleTypes(moduleTypes) {
        this.$container.find(".gui-popup-header").html("Module Types");
        const arr = [];
        const link = " (<a href=\"https://github.com/micromatch/micromatch\" target=\"_blank\">micromatch</a>)";
        const th = `<tr><th>Type</th><th>Color</th><th>Patterns${link}</th><th>Description</th></tr>`;
        arr.push(th);
        Object.keys(moduleTypes).forEach(type => {
            const item = moduleTypes[type];
            const color = item.color || "";
            let patterns = item.patterns || "";
            if (patterns instanceof Array) {
                patterns = patterns.map(item => {
                    return `<div style="white-space:nowrap;">${item}</div>`;
                }).join("");
            }
            const description = item.description || "";
            const html = `<tr><td style="color:${color};">${type}</td><td style="color:${color};">${color}</td><td>${patterns}</td><td>${description}</td></tr>`;
            arr.push(html);
        });
        const html = `<table class="gui-popup-table">${arr.join("")}</table>`;
        this.$container.find(".gui-popup-content").html(html);
    }

    renderInfo(title, list, color) {
        this.$container.find(".gui-popup-header").html(title);
        const arr = [];
        list.forEach(item => {
            const lines = item.split(/\n/g);
            const html = lines.map(function(line, i) {
                //space to &nbsp;
                line = line.replace(/ +/g, function(word) {
                    const arr = [];
                    arr.length = word.length + 1;
                    return arr.join("&nbsp;");
                });
                let c = "";
                if (i === 0) {
                    c = ` color-${color}`;
                }
                return `<div class="gui-popup-line${c}">${line}</div>`;
            }).join("");
            arr.push(`<div class="gui-popup-item">${html}</div>`);
        });
        const html = `<div class="gui-popup-list">${arr.join("")}</div>`;
        this.$container.find(".gui-popup-content").html(html);
    }

    destroy() {
        if (this.$container) {
            this.$container.remove();
            this.$container = null;
        }
    }

}