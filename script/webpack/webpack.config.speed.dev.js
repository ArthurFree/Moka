const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const smp = new SpeedMeasurePlugin();
const devConfig = require('./webpack.config.dev');

module.exports = smp.wrap(devConfig);
