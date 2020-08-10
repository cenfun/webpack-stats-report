![](assets/logo.svg)  
# webpack-stats-report
> Generation HTML report for [webpack](https://github.com/webpack/webpack) (v4,v5) [stats](https://webpack.js.org/api/stats/). 

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
webpack(webpackConfig, (err, stats) => {
    StatsReportGenerator({
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

* v1.1.1
    * new layout