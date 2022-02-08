const { isProd } = require('../const/env');

module.exports = () => {
    const plugins = [
        'autoprefixer',
        // A modular minifier, built on top of the PostCSS ecosystem.
        // https://github.com/cssnano/cssnano
        isProd ? 'cssnano' : null,
    ];

    return {
        plugins: plugins.filter(v => !!v),
    }
};
