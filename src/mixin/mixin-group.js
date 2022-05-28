export default {
    methods: {

        generateGridRows() {

            const g = this.group;

            if (!g.assets && !g.modules) {
                return [];
            }

            if (!g.modules) {
                return this.getAssetsRow().subs;
            }

            if (!g.assets) {
                return this.getModulesRow().subs;
            }

            return [this.getAssetsRow(), this.getModulesRow()];
        },

        getAssetsRow() {
            const assets = this.statsData.assets;
            const subs = assets.subs.map((sub) => {
                return {
                    ... sub,
                    percent: (sub.size / assets.size * 100).toFixed(2)
                };
            });
            return {
                ... assets,
                subs
            };
        },

        getModulesRow() {
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

            if (g.folder) {
                this.groupModulesByFolder(list);
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
            if (this.info.hasMinifiedAndGzipSize) {
                initSize(modules, 'sizeMinified');
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

            return modules;
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

        groupModulesByFolder(list) {

            list.forEach((item) => {

                const folder = item;
                folder.collapsed = false;
                folder.map = {};
                folder.files = [];

                folder.subs.forEach((m) => {
                    const arr = m.name.split(/\/|\\/g);
                    const paths = arr.filter((n) => {
                        //maybe need ../
                        if (!n || n === '.' || n === '..') {
                            return false;
                        }
                        return true;
                    });
                    const filename = paths.pop();
                    let parent = folder;
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
                initSubs(folder);

            });

        }

    }
};
