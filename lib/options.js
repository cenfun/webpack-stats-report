module.exports = {
    stats: null,
    title: 'Stats Report',
    output: 'stats-report.html',
    outputStatsJson: false,

    //require exporting module source
    gzipSize: false,

    moduleTypes: {
        external: {
            patterns: ['external**?(/**)'],
            color: 'silver',
            priority: 1,
            description: 'The webpack externals option provides a way of excluding dependencies from the output bundles. This feature is typically most useful to library developers, however there are a variety of applications for it.'
        },
        ignored: {
            patterns: ['**\\(ignored\\)'],
            color: 'olive',
            priority: 2,
            description: 'Ignored modules, such as Node.js built-in modules.'
        },
        nested: {
            patterns: ['?(**/)node_modules/**/node_modules/**'],
            color: 'magenta',
            priority: 3,
            description: 'Duplicated modules from nested node_modules when the versions are incompatible with the one at top. It should be a issue when multiple versions are bundled.'
        },
        buildin: {
            patterns: [
                '\\(webpack\\)/buildin/**',
                '?(**/)node_modules/webpack/buildin/**',
                //webpack 5 runtime
                'webpack/runtime/**'
            ],
            color: 'gray',
            priority: 4,
            description: 'Webpack built-in modules.'
        },
        polyfill: {
            patterns: [
                '?(**/)node_modules/core-js/**',
                '?(**/)node_modules/regenerator-runtime/**',
                '?(**/)node_modules/**/*polyfill*/**'
            ],
            color: 'maroon',
            priority: 5,
            description: 'core-js to polyfill ECMAScript features, regenerator-runtime for regenerator-compiled generator and async functions and others.'
        },
        loader: {
            patterns: ['?(**/)node_modules/*-loader/**'],
            color: 'darkgreen',
            priority: 6,
            description: 'Webpack built-in loaders.'
        },
        module: {
            patterns: ['?(**/)node_modules/**'],
            color: 'red',
            priority: 7,
            description: 'Normal modules.'
        },
        source: {
            patterns: ['**/src/**'],
            color: '',
            priority: 8,
            description: 'Source codes.'
        },
        other: {
            color: 'orange',
            priority: 100,
            description: ''
        }
    },

    overSizeColors: {
        red: 500 * 1024,
        orange: 200 * 1024
    },

    toJsonOptions: {
        source: true,
        reasons: false,
        chunkModules: false
    }
};
