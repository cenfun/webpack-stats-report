import Vue from "vue";
import App from "./app.vue";

new Vue({
    el: ".gui-app",
    render: (h) => {
        return h(App);
    }
});