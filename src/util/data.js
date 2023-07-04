import inflate from 'lz-utils/inflate';
import { isList } from './util.js';

const initData = function(statsData) {
    const map = statsData.map;
    delete statsData.map;

    const setMap = (list) => {
        if (!isList(list)) {
            return;
        }
        list.forEach((item) => {
            item.name = map[item.name];
            if (item.chunk) {
                item.chunk = map[item.chunk];
            }
            if (item.loaders) {
                item.loaders = item.loaders.map((l) => {
                    return map[l];
                });
            }
            if (item.paths) {
                item.paths = item.paths.map((p) => {
                    return map[p];
                });
            }
            if (item.bailout) {
                item.bailout = item.bailout.map((b) => {
                    return map[b];
                });
            }

            setMap(item.subs);
        });
    };

    [statsData.assets, statsData.modules].forEach((am) => {
        setMap(am.subs);
    });

    return statsData;
};


export default async (compressedStr) => {

    const reportStr = await inflate(compressedStr);

    const json = JSON.parse(reportStr);

    return initData(json);

};
