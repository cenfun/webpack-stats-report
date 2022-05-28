const StatsReportGenerator = require('./generator.js');
class StatsReportPlugin {

    constructor(option = {}) {
        this.option = option;
    }

    // Define `apply` as its prototype method which is supplied with compiler as its argument
    apply(compiler) {
        // Specify the event hook to attach to
        compiler.hooks.done.tapPromise('StatsReportPlugin', (stats) => {
            return StatsReportGenerator({
                ... this.option,
                stats
            });
        });
    }
}

module.exports = StatsReportPlugin;
