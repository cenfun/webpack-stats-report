module.exports = {
    stats: null,
    title: "Stats Report",
    output: "stats-report.html",
    outputStatsJson: false,
    toJsonOptions: {
        reasons: false,
        chunkModules: false,
        source: false
    },
    colorConditions: {
        redSizeGT: 500 * 1024,
        orangeSizeGT: 200 * 1024,
        redNameNotIncludes: []
    }
};