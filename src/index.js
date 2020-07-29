
import { Grid, $ } from "turbogrid";
import css from "./style.css";
import tempMain from "./main.html";
import Detail from "./detail.js";
import Util from "./util.js";

const style = document.createElement("style");
style.setAttribute("type", "text/css");
style.innerHTML = css;
document.head.appendChild(style);

document.body.innerHTML = tempMain;

const statsData = Util.initStatsData(window.statsData);

let grid;

let keywords = [];
let checkedList = ["assets", "chunks", "modules"];
const bindEvents = function() {
    const $keywords = $(".gui-keywords");
    $keywords.bind("keyup change", () => {
        const nv = $keywords.val().trim().toLowerCase();
        keywords = nv.split(" ").filter(item => item);
        grid.update();
    });
    const $checkbox = $(".gui-checkbox");
    $checkbox.bind("change", (e) => {
        checkedList = [];
        $checkbox.each(item => {
            if (item.checked) {
                checkedList.push(item.value);
            }
        });
        grid.update();
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

    const modules = rows.filter(item => item.id === "modules")[0].subs;
    let totalModulesSize = 0;
    modules.forEach(function(m) {
        totalModulesSize += m.size;
    });
    const totalModulesLen = modules.length;

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

    grid.bind("onRenderUpdate", function() {

        if (!$(".gui-modules").get(0).checked) {
            $(".gui-filter-info").html("");
            return;
        }

        let len = 0;
        let size = 0;
        const rows = grid.getGridRowsData();
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
        if (len !== totalModulesLen) {
            const per = (size / totalModulesSize * 100).toFixed(2);
            sizeStr += `, ${per}%`;
        }
        const info = `Found <b>${len.toLocaleString()}</b> modules (Size: ${sizeStr})`;
        $(".gui-filter-info").html(info);
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

            let id = rowData.id;
            if (rowData.tg_parent) {
                id = rowData.tg_parent.id;
            }
            if (checkedList.indexOf(id) === -1) {
                return false;
            }

            rowData.name_matched = null;
            if (!keywords.length) {
                return true;
            }
            const name = (`${rowData.name}`).toLowerCase();
            for (const k of keywords) {
                const index = name.indexOf(k);
                if (index !== -1) {
                    rowData.name_matched = {
                        index: index,
                        length: k.length
                    };
                    return true;
                }
            }
            return false;
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