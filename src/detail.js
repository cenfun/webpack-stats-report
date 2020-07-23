
import tempDetail from "./detail.html";

export default class Detail {

    constructor($, rowData) {
        this.$container = $(tempDetail).appendTo(document.body);

        const $name = this.$container.find(".gui-name");
        $name.find(".gui-detail-item").html(rowData.name);

        const $asset = this.$container.find(".gui-asset");
        if (rowData.asset) {
            $asset.find(".gui-detail-item").html(rowData.asset);
        } else {
            $asset.remove();
        }

        const pathStr = rowData.issuerPath.map(item => {
            return `<div class="gui-detail-item gui-detail-arrow">${item}</div>`;
        }).join("");
    
        const $path = this.$container.find(".gui-path");
        $path.find(".gui-detail-list").html(pathStr);
        
        const $chunk = this.$container.find(".gui-chunk");
        $chunk.find(".gui-detail-item").html(rowData.chunk);

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