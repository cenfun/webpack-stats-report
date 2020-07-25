const StatsReportPlugin = require("./lib/plugin.js");
module.exports = {
    mode: "production",
    output: {
        filename: "webpack-stats-report.js",
        umdNamedDefine: true,
        library: "webpack-stats-report",
        libraryTarget: "umd"
    },
    plugins: [new StatsReportPlugin({
        title: "Stats Report - webpack-stats-report",
        output: ".temp/stats-report.html",
        outputStatsJson: true
    })],
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
                loader: "babel-loader",
                options: {
                    cacheDirectory: true,
                    babelrc: false,
                    presets: ["@babel/preset-env"]
                }
            }
        }, {
            test: /\.(css|html)$/,
            exclude: /node_modules/,
            use: {
                loader: "raw-loader",
                options: {
                    esModule: false
                }
            }
        }]
    }
};