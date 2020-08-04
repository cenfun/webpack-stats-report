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

const tempList = `
    <div class="gui-popup-list"></div>
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
        this.$container.find(".gui-popup-content").html(tempList);
        const $list = this.$container.find(".gui-popup-list");
        Object.keys(moduleTypes).forEach(type => {
            const item = moduleTypes[type];
            const html = `<span style="margin-right:20px;color:${item.color || ""};">${type}</span> ${item.patterns || ""}`;
            this.$(`<div class="gui-popup-item">${html}</div>`).appendTo($list);
        });
    }

    renderInfo(title, list, color) {
        this.$container.find(".gui-popup-header").html(title);
        this.$container.find(".gui-popup-content").html(tempList);
        const $list = this.$container.find(".gui-popup-list");
        $list.addClass(`color-${color}`);
        list.forEach(item => {
            const lines = item.split(/\n/g);
            const html = lines.map(function(line, i) {
                //space to &nbsp;
                line = line.replace(/ +/g, function(word) {
                    const arr = [];
                    arr.length = word.length + 1;
                    return arr.join("&nbsp;");
                });
                return `<div class="gui-popup-line">${line}</div>`;
            }).join("");
            this.$(`<div class="gui-popup-item">${html}</div>`).appendTo($list);
        });

    }

    destroy() {
        if (this.$container) {
            this.$container.remove();
            this.$container = null;
        }
    }

}