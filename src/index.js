
import { Grid, $ } from "turbogrid";
import css from "./style.css";
import tempMain from "./main.html";
import Detail from "./detail";

const style = document.createElement("style");
style.setAttribute("type", "text/css");
style.innerHTML = css;
document.head.appendChild(style);

document.body.innerHTML = tempMain;

const statsData = window.statsData;

let grid;

const toNum = function(num, toInt) {
    if (typeof (num) !== "number") {
        num = parseFloat(num);
    }
    if (isNaN(num)) {
        num = 0;
    }
    if (toInt) {
        num = Math.round(num);
    }
    return num;
};

const BF = function(v, digits = 1, base = 1024) {
    v = toNum(v, true);
    if (v === 0) {
        return "0B";
    }
    let prefix = "";
    if (v < 0) {
        v = Math.abs(v);
        prefix = "-";
    }
    const units = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    for (let i = 0, l = units.length; i < l; i++) {
        const min = Math.pow(base, i);
        const max = Math.pow(base, i + 1);
        if (v > min && v < max) {
            const unit = units[i];
            v = `${prefix + (v / min).toFixed(digits)} ${unit}`;
            break;
        }
    }
    return v;
};

let keywords = "";
const $keywords = $(".gui-keywords").val(keywords);
const bindEvents = function() {
    const events = ["keyup", "change"];
    events.forEach(type => {
        $keywords.bind(type, () => {
            const nv = $keywords.val().trim().toLowerCase();
            const ov = keywords;
            if (nv === ov) {
                return;
            }
            keywords = nv;
            grid.update();
        });
    });
};


const initTabs = function() {
    $(".gui-tab").delegate(".gui-tab-item", "click", function(e) {
        const $item = $(e.target);
        let data = $item.attr("data");
        data = data || "table";
        $(".gui-tab-item").removeClass("selected");
        $(".gui-body-item").removeClass("selected");
        $(`.gui-tab-item[data='${data}']`).addClass("selected");
        $(`.gui-body-item[data='${data}']`).addClass("selected");
    });
};


const createGrid = function() {

    const colorConditions = statsData.colorConditions;
    const rows = statsData.rows;

    grid = new Grid(".gui-grid");

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

    grid.setData(gridData);

    grid.bind("onClick", function(e, d) {
        this.unselectAll();
        this.setSelectedRow(d.row, d.e);
    });

    grid.bind("onRenderComplete", function() {
        bindEvents();
    });

    const modules = rows.filter(item => item.id === "modules")[0].subs;
    let allTotalSize = 0;
    modules.forEach(function(m) {
        allTotalSize += m.size;
    });
    const allLen = modules.length;

    let previousTotalSize;
    grid.bind("onRenderUpdate", function() {
        let totalSize = 0;
        const rows = grid.getGridRowsData();
        rows.forEach(item => {
            totalSize += item.size;
        });
        if (totalSize === previousTotalSize) {
            return;
        }
        previousTotalSize = totalSize;
        const len = rows.length;
        let size = `<b>${BF(totalSize)}</b>`;
        if (len !== allLen) {
            const per = (totalSize / allTotalSize * 100).toFixed(2);
            size += `, ${per}%`;
        }
        const info = `Found <b>${len.toLocaleString()}</b> modules (Size: ${size})`;
        $(".gui-filter-info").html(info);
    });

    grid.bind("onHeaderClick", function(e, d) {
        if (d.e.target.nodeName === "INPUT" || d.e.target.nodeName === "LABEL") {
            d.e.stopImmediatePropagation();
        }
    });

    let detail;
    grid.bind("onClick", function(e, d) {
        const icon = d.e.target;
        if (icon.classList.contains("tg-detail-icon")) {
            const rowData = this.getRowItem(d.row);

            if (detail) {
                detail.destroy();
            }
            detail = new Detail($, rowData);
        }
    });

    grid.bind("onResize", function(e, d) {

        let width = 0;
        columns.forEach(item => {
            if (item.id === "name") {
                return;
            }
            width += item.width;
        });
        const totalWidth = $(".gui-grid").width();
        const w = totalWidth - width - grid.getScrollBarWidth();

        grid.setColumnWidth("name", w);
    });

    grid.setOption({
        bindWindowResize: true,
        textSelectable: true,
        rowHeight: 27,
        sortField: "size",
        sortAsc: false,
        sortOnInit: true,
        collapseAll: null,
        rowNumberType: "list",
        rowFilter: function(rowData) {
            rowData.name_matched = null;
            if (!keywords) {
                return true;
            }
            const arr = keywords.split(" ");
            const name = (`${rowData.name}`).toLowerCase();
            for (const item of arr) {
                if (item && name.indexOf(item) !== -1) {
                    rowData.name_matched = item;
                    return true;
                }
            }
            return false;
        },
        treeFormat: function(v, rd, cd, ri, ci, node) {
            const nm = rd.name_matched;
            if (nm) {
                const str = `<b class="color-match">${nm}</b>`;
                v = v.split(nm).join(str);
            }
            
            const sl = rd.tg_subs_length || rd.tg_s_length;
            if (sl) {
                v += ` (${sl.toLocaleString()})`;
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
            const s = BF(v);
            if (v > colorConditions.redSizeGT) {
                return `<span class="color-red">${s}</span>`;
            }
            if (v > colorConditions.orangeSizeGT) {
                return `<span class="color-orange">${s}</span>`;
            }
            return s;
        }
    });

    grid.render();
};

window.onload = function() {
    $(".gui-title").html(statsData.title);

    const date = new Date(statsData.timestamp).toLocaleString();
    const info = `Generated ${date}`;
    $(".gui-info").html(info);

    initTabs();
    createGrid();
};