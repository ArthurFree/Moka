const path = require('path');

module.exports = {
    mode: process.env.NODE_ENV ?? 'production',
    isDevServer: process.env.WEBPACK_IS_DEV_SERVER === 'ture',
    isProd: process.env.NODE_ENV === 'production',
    isDev: process.env.NODE_ENV === 'development',
    defaultdevServerPort: 8080,
};
