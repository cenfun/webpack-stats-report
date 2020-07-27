module.exports = {
    stats: null,
    title: "Stats Report",
    output: "stats-report.html",
    outputStatsJson: false,

    sourceMatch: ["**/src/**"],
    // app or component
    sourceMode: "component",

    silent: false,

    sizeIfGT: {
        error: 500 * 1024,
        warn: 200 * 1024
    },

    toJsonOptions: {
        reasons: false,
        chunkModules: false,
        source: false
    }
};