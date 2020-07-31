
import Popup from "./popup.js";

const temp = `
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

export default class PopupDetail extends Popup {

    render(rowData) {
        this.$container.find(".gui-popup-header").html("Module Detail");

        this.$container.find(".gui-popup-content").html(temp);

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

}