<template>
    <div class="gui-popup-list">
        <div v-for="(lines, i) in items" :key="i" class="gui-popup-item">
            <div v-for="(line, j) in lines" :key="j" class="gui-popup-line"
                 v-html="line"
            />
        </div>
    </div>
</template>
<script>
export default {
    props: {
        list: {
            type: Array,
            default: () => ([])
        }
    },

    data() {
        return {
            items: []
        };
    },

    created() {

        this.items = this.list.map((item, index) => {
            return item.split(/\n/g).map((line, i) => {
                //space to &nbsp;
                const l = line.replace(/\s+/g, function(word) {
                    const arr = [];
                    arr.length = word.length + 1;
                    return arr.join("&nbsp;");
                });
                if (i === 0) {
                    return `${index + 1}. ${l}`;
                }
                return l;
            });
        });

    }
};
</script>