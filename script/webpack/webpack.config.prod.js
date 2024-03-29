const path = require('path');
// https://stackoverflow.com/questions/70715794/typeerror-minicssextractplugin-is-not-a-constructor/70716720
const MiniCssExtractPlugin = require('mini-css-extract-plugin').default;
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { merge } = require('webpack-merge');

const common = require('./webpack.config.common');
const dirs = require('../const/paths');

module.exports = merge(common, {
    mode: 'production',
    devtool: false,
    output: {
        path: dirs.build,
        publicPath: '/',
        filename: 'js/[name].[contenthash].bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            esModule: false,
                        },
                    },
                    {
                        loader: 'css-loader',
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                config: path.join('./postcss.js'),
                            },
                            sourceMap: true,
                        },
                    }
                ],
            },
            // sassModuleRule
            {
                test: /\.module\.s([ca])ss$/,
                use: [
                    // miniCssExtractLoader
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            esModule: false,
                        },
                    },
                    // typingsCssModulesLoader
                    {
                        loader: '@teamsupercell/typings-for-css-modules-loader',
                        options: {
                            banner:
                                '// autogenerated by typings-for-css-modules-loader. \n// Please do not change this file!',
                            formatter: 'prettier',
                        },
                    },
                    // cssLoader
                    {
                        loader: 'css-loader',
                        options: {
                            esModule: false,
                            modules: {
                                exportLocalsConvention: 'camelCaseOnly',
                                localIdentName: '[local]__[contenthash:base64:5]',
                            },
                        }
                    },
                    // postCssLoader
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                config: path.join('./postcss.js'),
                            },
                            sourceMap: true,
                        },
                    },
                    // TODO: 待研究
                    /* {
                        loader: 'resolve-url-loader',
                        options: {
                            sourceMap: true,
                        },
                    } */
                    // sassLoaderItems
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true,
                            // Prefer `dart-sassRules`
                            implementation: require('sass'),
                        },
                    },
                    // TODO: sass-resources-loader 作用？
                ],
            },
            // sassRule
            {
                // test: /\.(sass|scss|css)$/,
                test: /\.s([ca])ss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            esModule: false,
                        },
                    },
                    {
                        loader: 'css-loader',
                        options: { sourceMap: true, importLoaders: 1, modules: false },
                    },
                    // postcss-loader 设置 autoprefix
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                config: path.join('./postcss.js'),
                            },
                            sourceMap: true,
                        },
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true,
                            // Prefer `dart-sassRules`
                            implementation: require('sass'),
                        },
                    },
                ],
            }
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'styles/[name].[contenthash].css',
            chunkFilename: '[id].css',
        }),
    ],
    optimization: {
        minimize: true,
        minimizer: [new CssMinimizerPlugin(), '...'],
        runtimeChunk: {
            name: 'runtime,'
        }
    },
    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000,
    }
});
