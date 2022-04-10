const fs = require('fs');
const path = require('path');
const assert = require('assert');
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
assert.strictEqual(Util.isMatch('/test/cases sync ^\\.\\/[^/]+\\/[^/]+\\/index\\.js$', sourcePatterns), true);


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
const statsJson = require('./webpack5.stats.js');
const outputPath = path.resolve(__dirname, '../.temp/stats-report-webpack5.html');

StatsReportGenerator({
    //options
    title: 'Stats Report - webpack5',
    output: outputPath,
    outputStatsJson: true,

    //test if no source
    generateMinifiedAndGzipSize: true,

    //custom module types
    moduleTypes: {
        test: {
            patterns: ['\\(webpack\\)/test/*/**'],
            color: 'green',
            priority: 3.1
        },
        source: {
            patterns: ['*webpack/**']
        }
    },
    //require one more option stats
    stats: statsJson
}).then(function() {
    console.log(outputPath);
    assert(fs.existsSync(outputPath));
});