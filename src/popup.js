
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

    render() {
        
    }

    destroy() {
        if (this.$container) {
            this.$container.remove();
            this.$container = null;
        }
    }

}