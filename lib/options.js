module.exports = {
    stats: null,
    title: "Stats Report",
    output: "stats-report.html",
    outputStatsJson: false,

    moduleTypes: {
        external: {
            patterns: ["external**"],
            color: "gray",
            description: "The webpack externals option provides a way of excluding dependencies from the output bundles. This feature is typically most useful to library developers, however there are a variety of applications for it."
        },
        ignored: {
            patterns: ["**\\(ignored\\)"],
            color: "orange",
            description: "Ignored modules, such as Node.js built-in modules."
        },
        nested: {
            patterns: ["?(**/)node_modules/**/node_modules/**"],
            color: "magenta",
            description: "Duplicated modules from nested node_modules when the versions are incompatible with the one at top. It should be a issue when multiple versions are bundled."
        },
        buildin: {
            patterns: [
                "\\(webpack\\)*/**",
                "?(**/)node_modules/webpack/**"
            ],
            color: "maroon",
            description: "Webpack built-in modules."
        },
        polyfill: {
            patterns: [
                "?(**/)node_modules/core-js/**",
                "?(**/)node_modules/regenerator-runtime/**",
                "?(**/)node_modules/**/*polyfill*/**"
            ],
            color: "olive",
            description: "core-js to polyfill ECMAScript features, regenerator-runtime for regenerator-compiled generator and async functions and others."
        },
        loader: {
            patterns: ["?(**/)node_modules/*-loader/**"],
            color: "darkslateblue",
            description: "Webpack built-in loaders."
        },
        module: {
            patterns: ["?(**/)node_modules/**"],
            color: "red",
            description: "Normal modules."
        },
        source: {
            patterns: ["**/src/**"],
            color: "",
            description: "Source codes."
        },
        other: {
            color: "orangered",
            description: ""
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