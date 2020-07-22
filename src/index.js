
import { Grid, $ } from "turbogrid";

const statsData = window.statsData;

const template = `
<div class="main">
    <div class="header">
        Stats Report
        <span class="generated-date"></span>
    </div>
    <div class="filter">
        Name Filter:
        <input class="gui-input name_keywords" onfocus="this.select();" placeholder="keywords" value="" />
        <span class="total-info"></span>
    </div>
    <div class="grid"></div>
</div>
<div class="footer">generated 2020-07-22</div>
`;

let grid;
const $grid = document.querySelector(".grid");

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

const store = {
    key(k) {
        return `stats_report_${k}`;
    },
    get(k, dv = "") {
        k = store.key(k);
        const v = window.localStorage.getItem(k);
        if (v === null) {
            return dv;
        }
        return v;
    },
    set(k, v) {
        k = store.key(k);
        window.localStorage.setItem(k, v);
    }
};

//modules
const data = {
    columns: [{
        id: "name",
        name: "Name",
        width: 750,
        maxWidth: 2048
    }, {
        id: "size",
        name: "Size",
        align: "right",
        dataType: "size",
        width: 80
    }, {
        id: "chunks",
        name: "Chunks",
        width: 165
    }, {
        id: "assets",
        name: "Assets"
    }, {
        id: "depth",
        name: "Depth"
    }],
    rows: statsData.modules
};

let keywords = store.get("name") || "";
document.querySelector(".name_keywords").value = keywords;
const bindEvents = function() {
    const events = ["keyup", "change"];
    const elem = document.querySelector(".name_keywords");
    events.forEach(type => {
        $(elem).bind(type, () => {
            const nv = elem.value.trim().toLowerCase();
            const ov = store.get("name");
            if (nv === ov) {
                return;
            }
            keywords = nv;
            store.set("name", nv);
            grid.update();
        });
    });
};


let detail;
const clickDetailHandler = function(e) {
    if (!detail) {
        return;
    }
    const main = detail.find(".gui-detail-main").get(0);
    if (main === e.target || main.contains(e.target)) {
        return;
    }
    hideDetail();
};

const hideDetail = function() {
    document.removeEventListener("click", clickDetailHandler);
    if (detail) {
        detail.remove();
        detail = null;
    }
};

const showDetail = function(icon, rowData) {

    if (detail) {
        hideDetail();
        return;
    }

    hideDetail();


    const issuerPath = rowData.issuerPath.map(item => {
        return `<div class="gui-detail-item gui-detail-arrow">${item}</div>`;
    }).join("");

    const html = `
            <div class="gui-detail">
                <div class="gui-detail-main">
                    <div class="gui-detail-content">
                        <div class="gui-detail-title">Chunk:</div>
                        <div class="gui-detail-item">${rowData.chunks}</div>
                        <div class="gui-detail-title">Model Name:</div>
                        <div class="gui-detail-item gui-detail-arrow">${rowData.name}</div>
                        <div class="gui-detail-title">Issuer Path:</div>
                        <div class="gui-detail-list">${issuerPath}</div>
                    </div>
                </div>
                <div class="gui-detail-close">X</div>
            </div>  
            `;

    detail = $(html).appendTo(document.body).show();

    //close event handler
    setTimeout(function() {
        document.addEventListener("click", clickDetailHandler);
    }, 100);

};

const createGrid = function() {

    grid = new Grid($grid);

    grid.bind("onClick", function(e, d) {
        this.unselectAll();
        this.setSelectedRow(d.row, d.e);
    });

    grid.bind("onRenderComplete", function() {
        bindEvents();
    });

    let allTotalSize = 0;
    statsData.modules.forEach(function(m) {
        allTotalSize += m.size;
    });
    const allLen = statsData.modules.length;

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
        document.querySelector(".total-info").innerHTML = info;
    });

    grid.bind("onHeaderClick", function(e, d) {
        if (d.e.target.nodeName === "INPUT" || d.e.target.nodeName === "LABEL") {
            d.e.stopImmediatePropagation();
        }
    });

    grid.bind("onClick", function(e, d) {
        const icon = d.e.target;
        if (icon.classList.contains("tg-detail-icon")) {
            const rowData = this.getRowItem(d.row);
            showDetail(icon, rowData);
        }
    });

    grid.setOption({
        bindWindowResize: true,
        textSelectable: true,
        rowHeight: 27,
        sortField: "size",
        sortAsc: false,
        sortOnInit: true,
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
            if (v) {
                const nm = rd.name_matched;
                if (nm) {
                    const str = `<span class="color-match">${nm}</span>`;
                    v = v.split(nm).join(str);
                }
            }
            v += `<div class="tg-cell-hover-icon tg-detail-icon" title="Click for Issuer Detail">
                        <div class="tg-issuer-icon" />
                    </div>`;
            return v;
        },
        sizeFormat: function(v, rowData) {
            const s = BF(v);
            if (v > 500 * 1024) {
                return `<span class="color-red">${s}</span>`;
            }
            if (v > 200 * 1024) {
                return `<span class="color-orange">${s}</span>`;
            }
            return s;
        }
    });
    grid.setData(data);
    grid.render();
};

window.onload = function() {
    document.querySelector(".generated-date").innerHTML = `(${statsData.date})`;
    createGrid();
};