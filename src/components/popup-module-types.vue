<template>
    <div class="gui-module-types">
        <table class="gui-popup-table">
            <tr>
                <th>Type</th>
                <th>Color</th>
                <th>Patterns (<a href="https://github.com/micromatch/micromatch" target="_blank">micromatch</a>)</th>
                <th>Description</th>
            </tr>
            <tr v-for="(item, i) in list" :key="i">
                <td>
                    {{ item.type }}
                </td>
                <td :style="{color:item.color}">
                    {{ item.color }}
                </td>
                <td>
                    <div v-for="(p, j) in item.patterns" :key="j" class="gui-popup-nowrap">
                        {{ p }}
                    </div>
                </td>
                <td>{{ item.description }}</td>
            </tr>
        </table>
    </div>
</template>
<script>
import Util from "../helper/util.js";

export default {
    props: {
        moduleTypes: {
            type: Object,
            default: () => ({})
        }
    },

    data() {
        return {
            list: []
        };
    },

    created() {
        this.list = Object.keys(this.moduleTypes).map(type => {
            const item = this.moduleTypes[type];
            item.patterns = Util.toList(item.patterns);
            item.type = type;
            return item;
        });
    }

};
</script>
