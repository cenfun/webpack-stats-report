# Webpack Stats Report
> Generating [Webpack](https://github.com/webpack/webpack) [Stats](https://webpack.js.org/api/stats/) Report in HTML Grid. 

![npm](https://img.shields.io/npm/v/webpack-stats-report.svg)
![npm](https://img.shields.io/npm/dt/webpack-stats-report.svg)
![David](https://img.shields.io/david/cenfun/webpack-stats-report.svg)

## Install
```sh
npm i webpack-stats-report -D
```
## Usage

### As a webpack plugin
```js
// webpack.config.js
const StatsReportPlugin = require("webpack-stats-report").StatsReportPlugin;
module.exports = {
    // ... configuration settings here ...
    plugins: [new StatsReportPlugin({ 
        //options
        title: "Stats Report - webpack-stats-report",
        output: ".temp/stats-report.html"
    })]
};
```

### As a Node API
```js
const webpack = require('webpack');
const StatsReportGenerator = require("webpack-stats-report").StatsReportGenerator;
webpack(webpackConfig, async (err, stats) => {
   await StatsReportGenerator({
        //options
        title: "Stats Report - webpack-stats-report",
        output: ".temp/stats-report.html",
        //require one more option stats
        stats: stats.toJson({
            //source for gzipSize = true
            source: true,
            reasons: false,
            chunkModules: false
        })
    });
});
```

## Options
```js
//default options
{
    title: "Stats Report",
    output: "stats-report.html",
    outputStatsJson: false,
    gzipSize: false
    ...
}
```
more details: [options.js](lib/options.js)

## Test
```sh
npm run test
```
see [test/test.js](test/test.js)

## Changelog
see [CHANGELOG.md](CHANGELOG.md)