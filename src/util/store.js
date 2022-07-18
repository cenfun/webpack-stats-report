const getKey = (k) => {
    return `wsr_${k}`;
};

export default {

    get(k, dv = '') {
        k = getKey(k);
        let v = null;
        try {
            v = window.localStorage.getItem(k);
        } catch (e) {
            console.log(e);
        }
        if (v === null) {
            return dv;
        }
        return v;
    },

    set(k, v) {
        k = getKey(k);
        try {
            window.localStorage.setItem(k, v);
        } catch (e) {
            console.log(e);
        }
    }

};
