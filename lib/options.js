module.exports = {
    stats: null,
    title: "Stats Report",
    output: "stats-report.html",
    outputStatsJson: false,

    moduleTypes: {
        external: {
            patterns: ["external**"],
            color: "gray"
        },
        ignored: {
            patterns: ["**\\(ignored\\)"],
            color: "orange"
        },
        nested: {
            patterns: ["?(**/)node_modules/**/node_modules/**"],
            color: "magenta"
        },
        buildin: {
            patterns: [
                "\\(webpack\\)*/**",
                "?(**/)node_modules/webpack/**"
            ],
            color: "maroon"
        },
        polyfill: {
            patterns: [
                "?(**/)node_modules/core-js/**",
                "?(**/)node_modules/regenerator-runtime/**",
                "?(**/)node_modules/**/*polyfill*/**"
            ],
            color: "olive"
        },
        loader: {
            patterns: ["?(**/)node_modules/*-loader/**"],
            color: "darkslateblue"
        },
        module: {
            patterns: ["?(**/)node_modules/**"],
            color: "red"
        },
        source: {
            patterns: ["**/src/**"],
            color: ""
        },
        other: {
            color: "orangered"
        }
    },

    overSizeColors: {
        red: 500 * 1024,
        orange: 200 * 1024
    },

    toJsonOptions: {
        reasons: false,
        chunkModules: false,
        source: false
    }
};