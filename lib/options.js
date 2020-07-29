module.exports = {
    stats: null,
    title: "Stats Report",
    output: "stats-report.html",
    outputStatsJson: false,

    typePatterns: {
        external: ["external*"],
        ignored: ["*\\(ignored\\)"],
        buildin: ["?(**/)node_modules/webpack/**"],
        polyfill: [
            "?(**/)node_modules/core-js/**",
            "?(**/)node_modules/regenerator-runtime/**",
            "?(**/)node_modules/**/*polyfill*/**"
        ],
        loader: ["?(**/)node_modules/*-loader/**"],
        module: ["?(**/)node_modules/**"],
        source: ["**/src/**"]
    },
    // app or component
    typeMode: "component",
    typeColors: {
        component: {
            external: "gray",
            ignored: "orange",
            buildin: "maroon",
            polyfill: "olive",
            loader: "darkslateblue",
            module: "red",
            source: "",
            other: "orangered"
        },
        app: {
            external: "orange",
            ignored: "deeppink",
            buildin: "",
            polyfill: "olive",
            loader: "darkslateblue",
            module: "",
            source: "",
            other: "orangered"
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