export default {
    methods: {

        generateGridRows() {

            if (this.tabName === 'assets') {
                return this.getAssetsRows();
            }

            return this.getModulesRows();

        },

        getAssetsRows() {
            const assets = this.statsData.assets;

            const rows = assets.subs.map((sub) => {
                return {
                    ... sub,
                    percent: (sub.size / assets.size * 100).toFixed(2)
                };
            });

            return rows;
        },

        getModulesRows() {
            const modules = {
                ... this.statsData.modules
            };
            let list = [modules];
            const g = this.group;
            if (g.chunk) {
                list = this.groupModulesByChunk(list);
            }

            if (g.type) {
                list = this.groupModulesByType(list);
            }

            if (g.path) {
                this.groupModulesByPath(list);
            }

            //final handler size and percent
            const initSize = function(parent, sizeId) {
                if (parent.subs) {
                    let size = 0;
                    parent.subs.forEach((sub) => {
                        initSize(sub, sizeId);
                        const n = sub[sizeId] || 0;
                        size += n;
                    });
                    parent[sizeId] = size;
                }
            };
            initSize(modules, 'size');

            if (this.info.gzipSize) {
                initSize(modules, 'sizeGzip');
            }

            const initPercent = function(parent) {
                if (parent.subs) {
                    const len = parent.subs.length;
                    parent.subs.forEach((sub) => {
                        if (len > 1) {
                            sub.percent = (sub.size / parent.size * 100).toFixed(2);
                        }
                        initPercent(sub);
                    });

                }
            };
            initPercent(modules);

            //only need subs
            const rows = modules.subs;

            return rows;
        },

        groupModulesByChunk(list) {
            let newList = [];
            list.forEach((item) => {

                const chunks = {};
                item.subs.forEach((sub) => {
                    const chunkName = sub.chunk;
                    let chunk = chunks[chunkName];
                    if (!chunk) {
                        chunk = {
                            name: chunkName,
                            chunk: chunkName,
                            collapsed: true,
                            subs: []
                        };
                        chunks[chunkName] = chunk;
                    }
                    chunk.subs.push({
                        ... sub
                    });
                });

                item.subs = Object.keys(chunks).map((k) => chunks[k]);

                newList = newList.concat(item.subs);

            });

            return newList;
        },

        groupModulesByType(list) {
            let newList = [];
            const moduleTypes = this.statsData.info.moduleTypes;
            list.forEach((item) => {

                const types = {};
                item.subs.forEach((sub) => {
                    const typeName = sub.type;
                    let type = types[typeName];
                    if (!type) {
                        type = {
                            name: typeName,
                            chunk: sub.chunk,
                            type: typeName,
                            collapsed: true,
                            subs: []
                        };
                        item.collapsed = false;
                        //color
                        const o = moduleTypes[typeName];
                        if (o && o.color) {
                            type.name_color = o.color;
                            type.type_color = o.color;
                        }

                        types[typeName] = type;
                    }
                    type.subs.push({
                        ... sub
                    });
                });

                item.subs = Object.keys(types).map((k) => types[k]);

                newList = newList.concat(item.subs);

            });

            return newList;
        },

        groupModulesByPath(list) {

            list.forEach((item) => {

                const path = item;
                path.collapsed = false;
                path.map = {};
                path.files = [];

                path.subs.forEach((m) => {
                    const arr = m.name.split(/\/+/g);
                    const paths = arr.filter((n) => {
                        //maybe need ../
                        if (!n || n === '.' || n === '..') {
                            return false;
                        }
                        return true;
                    });
                    const filename = paths.pop();
                    let parent = path;
                    paths.forEach((p) => {
                        let sub = parent.map[p];
                        if (!sub) {
                            sub = {
                                name: p,
                                collapsed: true,
                                map: {},
                                files: []
                            };
                            parent.map[p] = sub;
                        }
                        parent = sub;
                    });
                    parent.files.push({
                        ... m,
                        name: filename
                    });
                });

                const initSubs = function(parent) {
                    const map = parent.map;
                    const subs = Object.keys(map).map((k) => map[k]);
                    delete parent.map;

                    parent.subs = subs.concat(parent.files);
                    delete parent.files;

                    if (!parent.subs.length) {
                        delete parent.subs;
                    }

                    if (subs.length) {
                        subs.forEach((it) => {
                            initSubs(it);
                        });
                    }
                };
                initSubs(path);

            });

        }

    }
};
