
import { Grid, $ } from "turbogrid";
import css from "./style.css";
import tempMain from "./main.html";
import Popup from "./popup.js";
import Util from "./util.js";

const style = document.createElement("style");
style.setAttribute("type", "text/css");
style.innerHTML = css;
document.head.appendChild(style);
document.body.innerHTML = tempMain;

const statsData = Util.initStatsData(window.statsData);

//=================================================================================================================================

let popupDetail;
const showDetail = function(rowData) {
    if (popupDetail) {
        popupDetail.destroy();
    }
    popupDetail = new Popup();
    popupDetail.renderDetail(rowData);
};

let popupModuleTypes;
const showModuleTypes = function(moduleTypes) {
    if (popupModuleTypes) {
        popupModuleTypes.destroy();
    }
    popupModuleTypes = new Popup();
    popupModuleTypes.renderModuleTypes(moduleTypes);
};

let popupInfo;
const showInfo = function(title, list, color) {
    if (popupInfo) {
        popupInfo.destroy();
    }
    popupInfo = new Popup();
    popupInfo.renderInfo(title, list, color);
};

//=================================================================================================================================

let flatGrid;

const groups = {
    assets: true,
    chunks: true,
    modules: true
};
const keywords = {
    chunk: [],
    type: [],
    name: []
};

const bindEvents = function() {
    $(".gui-group").bind("change", function(e) {
        const item = e.currentTarget;
        groups[item.value] = item.checked;
        flatGrid.update();
    });
    $(".gui-keywords").bind("focus", function(e) {
        e.currentTarget.select();
    }).bind("keyup change", function(e) {
        const item = e.currentTarget;
        const nv = item.value.trim().toLowerCase();
        const nn = item.name;
        keywords[nn] = nv.split(" ").filter(item => item);
        flatGrid.update();
    });
};

const isMatch = function(value, list, rowData, matchedKey) {
    for (let i = 0, l = list.length; i < l; i++) {
        const k = list[i];
        const index = value.indexOf(k);
        if (index !== -1) {
            rowData[matchedKey] = {
                index: index,
                length: k.length
            };
            return true;
        }
    }
    return false;
};

const filterHandler = function(rowData) {
    let gid = rowData.id;
    if (rowData.tg_parent) {
        gid = rowData.tg_parent.id;
    }
    if (!groups[gid]) {
        return false;
    }
    for (const field in keywords) {
        const matchedKey = `${field}_matched`;
        rowData[matchedKey] = null;
        const list = keywords[field];
        if (!list.length) {
            continue;
        }
        const value = `${rowData[field]}`.toLowerCase();
        if (isMatch(value, list, rowData, matchedKey)) {
            continue;
        }
        return false;
    }
    return true;
};

const createFlatGrid = function() {

    const rows = [statsData.assets, statsData.chunks, statsData.modules];
    const totalModulesSize = statsData.modules.size;
    const totalModulesLength = statsData.modules.subs.length;

    flatGrid = new Grid(".gui-flat-grid");

    const columns = [{
        id: "name",
        name: "Name",
        maxWidth: 2048
    }, {
        id: "size",
        name: "Size",
        align: "right",
        dataType: "size",
        width: 80
    }, {
        id: "percent",
        name: "",
        sortable: false,
        formatter: "percent",
        width: 100
    }, {
        id: "type",
        name: "Type",
        align: "center",
        width: 65
    }, {
        id: "chunk",
        name: "Chunk",
        width: 80,
        maxWidth: 1024
    }, {
        id: "asset",
        name: "Asset",
        width: 80,
        maxWidth: 1024
    }, {
        id: "depth",
        name: "Depth",
        align: "center",
        width: 50
    }];

    const gridData = {
        columns: columns,
        rows: rows
    };

    flatGrid.setData(gridData);

    flatGrid.bind("onClick", function(e, d) {

        const icon = d.e.target;
        if (icon.classList.contains("tg-detail-icon")) {
            const rowData = this.getRowItem(d.row);
            showDetail(rowData);
        }

        this.unselectAll();
        this.setSelectedRow(d.row, d.e);
    });

    flatGrid.bind("onRenderComplete", function() {
        bindEvents();
    });

    flatGrid.bind("onRenderUpdate", function() {

        if (!$(".gui-modules").get(0).checked) {
            $(".gui-filter-info").html("");
            return;
        }

        let len = 0;
        let size = 0;
        const rows = flatGrid.getGridRowsData();
        rows.forEach(item => {
            if (!item.tg_parent) {
                return;
            }
            if (item.tg_parent.id !== "modules") {
                return;
            }
            size += item.size;
            len += 1;
        });
        
        let sizeStr = `<b>${Util.BF(size)}</b>`;
        if (len !== totalModulesLength) {
            const per = (size / totalModulesSize * 100).toFixed(2);
            sizeStr += `, ${per}%`;
        }
        const info = `Found <b>${len.toLocaleString()}</b> modules (Size: ${sizeStr})`;
        $(".gui-filter-info").html(info);
    });

    flatGrid.bind("onResize", function(e, d) {
        let width = 0;
        columns.forEach(item => {
            if (item.id === "name") {
                return;
            }
            width += item.width;
        });
        const totalWidth = $(".gui-flat-grid").width();
        const w = totalWidth - width - flatGrid.getScrollBarWidth();

        flatGrid.setColumnWidth("name", w);
    });

    flatGrid.setFormatter({
        percent: function(v, rd) {
            if (!rd.tg_parent) {
                return "";
            }
            const p = (rd.size / rd.tg_parent.size * 100).toFixed(2);
            return `<div class="gui-percent" title="${p}%"><div style="width:${p}%;"></div></div>`;
        }
    });

    flatGrid.setOption({
        bindWindowResize: true,
        textSelectable: true,
        rowHeight: 27,
        sortField: "size",
        sortAsc: false,
        sortOnInit: true,
        collapseAll: null,
        rowNumberType: "list",
        rowFilter: function(rowData) {
            return filterHandler(rowData);
        },
        stringFormat: function(v, rd, cd) {
            const id = cd.id;
            const color = rd[`${id}_color`];
            if (color) {
                v = `<span style="color:${color};">${v}</span>`;
            }
            return v;
        },
        treeFormat: function(v, rd, cd, ri, ci, node) {
            const nm = rd.name_matched;
            if (nm) {
                const left = v.substring(0, nm.index);
                const mid = v.substr(nm.index, nm.length);
                const right = v.substr(nm.index + nm.length);
                v = `${left}<b class="color-match">${mid}</b>${right}`;
            }
            
            const sl = rd.tg_subs_length || rd.tg_s_length;
            if (sl && sl > 1) {
                v += ` (${sl.toLocaleString()})`;
            }
            
            if (rd.name_color) {
                v = `<span style="color:${rd.name_color};">${v}</span>`;
            }
            
            if (rd.issuerPath) {
                v += `
                    <div class="tg-cell-hover-icon tg-detail-icon" title="Click for Detail">
                        <div class="tg-issuer-icon" />
                    </div>
                `;
            }
            return v;
        },
        sizeFormat: function(v, rowData) {
            const s = Util.BF(v);
            if (rowData.size_color) {
                return `<span style="color:${rowData.size_color};">${s}</span>`;
            }
            return s;
        }
    });

    flatGrid.render();
};

//=================================================================================================================================

const groupBy = [{
    id: "type",
    name: "Modules Group By Type"
}, {
    id: "chunk",
    name: "Modules Group By Chunk"
}];


let treeGrid;
const createTreeGrid = function() {
    if (treeGrid) {
        return;
    }
    treeGrid = true;

    const options = groupBy.map(item => {
        return `<option value="${item.id}">${item.name}</option>`;
    }).join("");

    $(".gui-group-by").html(options).bind("change", function() {
       
    });
   
};

//=================================================================================================================================

const initTabs = function() {
    $(".gui-tab").delegate(".gui-tab-item", "click", function(e) {
        const $item = $(e.target);
        let data = $item.attr("data");
        data = data || "flat";
        $(".gui-tab-item").removeClass("selected");
        $(".gui-body-item").removeClass("selected");
        $(`.gui-tab-item[data='${data}']`).addClass("selected");
        $(`.gui-body-item[data='${data}']`).addClass("selected");
        if (data === "tree") {
            createTreeGrid();
        }
    });
    //default
    createFlatGrid();
};

const initInfo = function() {
    $(".gui-title").html(statsData.title);

    //footer info
    const info = statsData.info;
    const list = [];

    list.push("<b class=\"gui-link gui-module-types\">Module Types</b>");

    const warnings = info.warnings.length;
    let warningsClassName = "gui-info-disabled";
    if (warnings > 0) {
        warningsClassName = "gui-link gui-info-warnings";
    }
    list.push(`<b class="${warningsClassName}">Warnings ${warnings}</b>`);
    
    const errors = info.errors.length;
    let errorsClassName = "gui-info-disabled";
    if (errors > 0) {
        errorsClassName = "gui-link gui-info-errors";
    }
    list.push(`<b class="${errorsClassName}">Errors ${errors}</b>`);

    $(".gui-info-left").html(list.join(""));

    $(".gui-module-types").bind("click", function(e) {
        showModuleTypes(info.moduleTypes);
    });

    $(".gui-info-errors,.gui-info-warnings").bind("click", function(e) {
        if ($(this).hasClass("gui-info-errors")) {
            showInfo("Errors", info.errors, "red");
        } else {
            showInfo("Warnings", info.warnings, "orange");
        }
    });

    const time = new Date(info.timestamp).toLocaleString();
    $(".gui-info-right").html(`Generated <span>${time}</span> <a href="https://webpack.js.org/" target="_blank">webpack</a> v${info.version}`);

};

window.onload = function() {
    initInfo();
    initTabs();
};