module.exports = {
    mode: "production",
    output: {
        filename: "webpack-stats-report.js",
        umdNamedDefine: true,
        library: "webpack-stats-report",
        libraryTarget: "umd"
    },
    module: {
        rules: [{
            test: /\.(css|html)$/,
            use: {
                loader: "raw-loader",
                options: {
                    esModule: false
                }
            }
        }]
    }
};