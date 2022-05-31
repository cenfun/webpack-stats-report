const StatsReportPlugin = require('./lib/index.js').StatsReportPlugin;
const VueLoaderPlugin = require('vue-loader').VueLoaderPlugin;
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    mode: 'production',
    //mode: 'development',
    //https://webpack.js.org/configuration/devtool/#devtool
    //devtool: 'source-map',

    output: {
        filename: 'webpack-stats-report.js',
        umdNamedDefine: true,
        library: 'webpack-stats-report',
        libraryTarget: 'umd'
    },

    plugins: [new VueLoaderPlugin(), new StatsReportPlugin({
        title: 'Stats Report - webpack-stats-report',
        output: 'docs/stats-report-wsr.html',
        outputStatsJson: true,
        gzipSize: true
    })],

    optimization: {
        //minimize: true, auto enabled with production mode
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    output: {
                        comments: false
                    }
                },
                extractComments: false
            })
        ]
    },

    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                    cacheDirectory: false,
                    babelrc: false,
                    presets: [['@babel/preset-env', {
                        'targets': [
                            'defaults',
                            'not IE 11',
                            'maintained node versions'
                        ]
                    }]]
                }
            }
        }, {
            test: /\.(css|scss)$/,
            use: [{
                loader: 'style-loader',
                options: {
                    //Reuses a single style element
                    injectType: 'singletonStyleTag',
                    attributes: {
                        //Add custom attrs to style for debug
                        context: 'webpack-stats-report'
                    }
                }
            }, {
                loader: 'css-loader',
                options: {
                    esModule: false,
                    import: false,
                    sourceMap: false
                }
            }, {
                // compiles Sass to CSS
                loader: 'sass-loader'
            }]
        }, {
            test: /\.vue$/,
            loader: 'vue-loader'
        }, {
            test: /\.(svg|png)$/i,
            type: 'asset/inline'
        }]
    }
};
