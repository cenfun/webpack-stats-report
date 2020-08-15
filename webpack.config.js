const StatsReportPlugin = require("./lib/index.js").StatsReportPlugin;
const VueLoaderPlugin = require("vue-loader").VueLoaderPlugin;
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    mode: "production",
    //mode: "development",
    output: {
        filename: "webpack-stats-report.js",
        umdNamedDefine: true,
        library: "webpack-stats-report",
        libraryTarget: "umd"
    },
    plugins: [new VueLoaderPlugin(), new StatsReportPlugin({
        title: "Stats Report - webpack-stats-report",
        output: ".temp/stats-report.html",
        outputStatsJson: true,
        generateMinifiedAndGzipSize: true,
        moduleTypes: {
            module: {
                color: ""
            }
        }
    })],
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    output: {
                        comments: false
                    }
                }
            })
        ]
    },
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
            test: /\.(css|scss)$/,
            sideEffects: true,
            use: [{
                loader: "style-loader",
                options: {
                    //Reuses a single style element
                    injectType: "singletonStyleTag",
                    attributes: {
                        //Add custom attrs to style for debug
                        context: "webpack-stats-report"
                    }
                }
            }, {
                loader: "css-loader",
                options: {
                    esModule: false,
                    import: false,
                    sourceMap: false
                }
            }, {
                // compiles Sass to CSS
                loader: "sass-loader"
            }]
        }, {
            test: /\.svg$/i,
            loader: "url-loader"
        }, {
            test: /\.vue$/,
            loader: "vue-loader",
            options: {
                hotReload: false
            }
        }]
    }
};