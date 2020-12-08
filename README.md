# Webpack Stats Report
> Generation HTML report for [webpack](https://github.com/webpack/webpack) (v4,v5) [stats](https://webpack.js.org/api/stats/). 

![npm](https://img.shields.io/npm/v/webpack-stats-report.svg)
![npm](https://img.shields.io/npm/dt/webpack-stats-report.svg)
![David](https://img.shields.io/david/cenfun/webpack-stats-report.svg)

![](assets/webpack-stats-report.gif)

## Install
```sh
npm i webpack-stats-report --save-dev
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
        stats: stats.toJson(toJsonOptions)
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
    generateMinifiedAndGzipSize: false
    ...
}
```
more details: [options.js](./lib/options.js)

## Test Webpack5 Stats
```sh
npm run test
```
see [./test/test.js](./test/test.js)

## Changelog

* v1.1.5
    * updated UI
* v1.1.4
    * updated to webpack5
    * fixed json filename and webpack5 buildin

* v1.1.3
    * fixed dependencies 
    * fixed module path format issue

* v1.1.2
    * added minified/gzip size

* v1.1.1
    * new layout
