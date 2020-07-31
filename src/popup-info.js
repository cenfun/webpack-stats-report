
import Popup from "./popup.js";

const temp = `
    <div class="gui-popup-list"></div>
`;

export default class PopupInfo extends Popup {

    render(title, list, color) {
        this.$container.find(".gui-popup-header").html(title);
        this.$container.find(".gui-popup-content").html(temp);
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

}