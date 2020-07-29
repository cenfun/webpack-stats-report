
import tempDetail from "./detail.html";

export default class Detail {

    constructor($, rowData) {
        this.$container = $(tempDetail).appendTo(document.body);

        const arrow = '<div class="gui-detail-arrow"></div>';

        const $name = this.$container.find(".gui-name");

        let name = "";
        if (rowData.loaders) {
            name += rowData.loaders.map(item => `${item}-loader -&gt; `).join("");
        }
        name += rowData.name;
        if (rowData.fullName) {
            name += `<div class="gui-detail-tip">(${rowData.fullName})</div>`;
        }
        $name.find(".gui-detail-item").html(name);

        const $asset = this.$container.find(".gui-asset");
        if (rowData.asset) {
            $asset.find(".gui-detail-item").html(rowData.asset);
        } else {
            $asset.remove();
        }

        const pathStr = rowData.issuerPath.map(item => {
            return `<div class="gui-detail-item">${arrow} ${item}</div>`;
        }).join("");
    
        const $path = this.$container.find(".gui-path");
        $path.find(".gui-detail-list").html(pathStr);
        
        const $chunk = this.$container.find(".gui-chunk");
        $chunk.find(".gui-detail-item").html(`${arrow} ${rowData.chunk}`);

        //close event handler
        setTimeout(() => {
            $(document).bind("click.detail", (e) => {
                if (!this.$container) {
                    return;
                }
                const $main = this.$container.find(".gui-detail-main");
                if ($main.get(0) === e.target || $main.contains(e.target)) {
                    return;
                }
                $(document).unbind("click.detail");
                this.destroy();
            });
        }, 100);
    }

    destroy() {
        if (this.$container) {
            this.$container.remove();
            this.$container = null;
        }
    }

}