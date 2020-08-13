const path = require("path");
const StatsReportGenerator = require("../lib").StatsReportGenerator;
const statsJson = require("./webpack5.stats.js");
StatsReportGenerator({
    //options
    title: "Stats Report - webpack5",
    output: path.resolve(__dirname, "../.temp/stats-report-webpack5.html"),
    outputStatsJson: true,
    //custom module types
    moduleTypes: {
        test: {
            patterns: ["\\(webpack\\)/test/*/**"],
            color: "green",
            priority: 3.1
        },
        source: {
            patterns: ["*webpack/**"]
        }
    },
    //require one more option stats
    stats: statsJson
});