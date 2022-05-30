const fs = require('fs');
const path = require('path');
const assert = require('assert');
const EC = require('eight-colors');
const Util = require('../lib/util.js');
const options = require('../lib/options.js');

console.log('==================================================================');
console.log('test formatMatchPath');
assert.strictEqual(Util.formatMatchPath('a/b/c'), 'a/b/c');
assert.strictEqual(Util.formatMatchPath('.a/b/c'), 'a/b/c');
assert.strictEqual(Util.formatMatchPath('./a/b/c'), 'a/b/c');
assert.strictEqual(Util.formatMatchPath('../a/b/c'), 'a/b/c');
assert.strictEqual(Util.formatMatchPath('../../a/b/c'), 'a/b/c');
assert.strictEqual(Util.formatMatchPath('../../../a/b/c'), 'a/b/c');
assert.strictEqual(Util.formatMatchPath('./../../a/b/c'), 'a/b/c');
assert.strictEqual(Util.formatMatchPath('../../a/b/c/../'), 'a/b/c/../');


console.log('==================================================================');
console.log('test isMatch source');

const sourcePatterns = options.moduleTypes.source.patterns;
assert.strictEqual(Util.isMatch('./packages/home/src/components/ sync \\.js$', sourcePatterns), true);
assert.strictEqual(Util.isMatch('./src/components/ sync \\.js$', sourcePatterns), true);
assert.strictEqual(Util.isMatch('./src/mixin/ sync \\.js$', sourcePatterns), true);
assert.strictEqual(Util.isMatch('/test/cases sync ^\\.\\/[^/]+\\/[^/]+\\/index\\.js$', sourcePatterns), false);
assert.strictEqual(Util.isMatch('multi ./src/main.ts', sourcePatterns), true);

console.log('==================================================================');
console.log('test isMatch external');

const externalPatterns = options.moduleTypes.external.patterns;
assert.strictEqual(Util.isMatch('external "name"', externalPatterns), true);
assert.strictEqual(Util.isMatch('external "pre-name"', externalPatterns), true);
assert.strictEqual(Util.isMatch('external "node_modules/pre-name"', externalPatterns), true);
assert.strictEqual(Util.isMatch('external "@package/pre-name"', externalPatterns), true);
assert.strictEqual(Util.isMatch('external "@pre-package/pre-name"', externalPatterns), true);


console.log('==================================================================');
console.log('test isMatch loader');
const loaderPatterns = options.moduleTypes.loader.patterns;
assert.strictEqual(Util.isMatch('../d-loader', loaderPatterns), false);
assert.strictEqual(Util.isMatch('../node_modules/xxx-loader/path-to', loaderPatterns), true);
assert.strictEqual(Util.isMatch('../../node_modules/xxx-loader/path-to', loaderPatterns), true);

console.log('==================================================================');
console.log('test StatsReportGenerator');
const StatsReportGenerator = require('../lib').StatsReportGenerator;
const statsJson = require('./case.json');
const caseOutputPath = path.resolve(__dirname, '../.temp/stats-report-case.html');

StatsReportGenerator({
    //options
    title: 'Stats Report - case',
    output: caseOutputPath,
    outputStatsJson: true,

    //test if no source
    gzipSize: true,

    //custom module types
    moduleTypes: {
    },
    //require one more option stats
    stats: statsJson
}).then(function() {
    console.log('=============================async log start ...');
    console.log(caseOutputPath);
    assert(fs.existsSync(caseOutputPath));
    console.log('=============================async log end');
});

console.log('==================================================================');
console.log('test webpack build');

const testOutputPath = path.resolve(__dirname, '../.temp/stats-report-test.html');

const webpack = require('webpack');

const getWebpackConf = function() {
    const webpackConf = require('../webpack.config.js');

    //webpackConf.mode = 'development';

    webpackConf.entry = {
        entry1: path.resolve(__dirname, 'src/entry1.js'),
        entry2: path.resolve(__dirname, 'src/entry2.js')
    };

    webpackConf.output = {
        path: path.resolve(__dirname, '../.temp'),
        umdNamedDefine: true,
        library: 'test',
        libraryTarget: 'umd'
    };

    const StatsReportPlugin = require('../lib/index.js').StatsReportPlugin;
    const VueLoaderPlugin = require('vue-loader').VueLoaderPlugin;

    webpackConf.plugins = [new VueLoaderPlugin(), new StatsReportPlugin({
        title: 'Stats Report - test',
        output: testOutputPath,
        outputStatsJson: true,
        gzipSize: true
    })];

    //webpackConf.externals = ['vue'];


    return webpackConf;
};

const conf = getWebpackConf();

webpack(conf, function(err, stats) {
    if (err) {
        console.log(err.stack || err);
        if (err.details) {
            console.log(err.details);
        }
        return;
    }

    const info = stats.toJson();

    // error for project
    if (stats.hasErrors()) {
        EC.logRed(`ERROR: Found ${info.errors.length} Errors`);
    }

    if (stats.hasWarnings()) {
        EC.logYellow(`WARN: Found ${info.warnings.length} Warnings`);
    }

    console.log('webpack build finish');
    console.log(testOutputPath);
    assert(fs.existsSync(testOutputPath));

});
