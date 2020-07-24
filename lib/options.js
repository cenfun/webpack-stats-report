module.exports = {
    stats: null,
    title: "Stats Report",
    output: "stats-report.html",
    colorConditions: {
        redSizeGT: 500 * 1024,
        orangeSizeGT: 200 * 1024,
        redNameNotIncludes: []
    }
};