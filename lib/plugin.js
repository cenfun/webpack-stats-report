const StatsReportGenerator = require("./generator.js");
class StatsReportPlugin {

    constructor(option = {}) {
        this.option = option;
    }

    // Define `apply` as its prototype method which is supplied with compiler as its argument
    apply(compiler) {
        // Specify the event hook to attach to
        compiler.hooks.emit.tapAsync("StatsReportPlugin", (compilation, callback) => {

            const stats = compilation.getStats();
            
            StatsReportGenerator({
                ... this.option,
                stats
            });
  
            callback();
        });
    }
}

module.exports = StatsReportPlugin;