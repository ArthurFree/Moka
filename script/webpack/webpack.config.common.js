const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const ForTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const { ProvidePlugin, DefinePlugin } = require('webpack');

const { rootDir, src, dist, config, public } = require('../const/paths');
const { isDev, isDevServer, isProd, mode } = require('../const/env');

console.log('=== html ===', path.join(rootDir, './script/webpack', './index.html'));
console.log('=== dist ===', dist);

module.exports = {
    entry: [`${src}/index.tsx`],
    output: {
        path: dist,
        publicPath: '/',
        filename: isDevServer
            ? '[name].[fullhash].js'
            : '[name].[contenthash].js',
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Editor',
            inject: true,
            filename: 'index.html',
            template: path.join(rootDir, './script/webpack', './index.html'),
        }),
        new ProvidePlugin({}),
        new DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(mode),
            },
            IS_PROD: isProd,
            IS_DEV: isDev,
            IS_DEV_SERVER: isDevServer,
            VDITOR_VERSION: JSON.stringify('3.8.11'),
        }),
        new ForTsCheckerWebpackPlugin({
            async: isDev,
            typescript: {
                configFile: path.join(rootDir, '/tsconfig.json'),
                configOverwrite: {
                    // compilerOptions: { skipLibCheck: true, sourceMap: false, inlineSourceMap: false, declarationMap: false }
                    exclude: ['./src/editor/'],
                },
            },
            // eslint: {
            //     enabled: true,
            //     files: './src/**/*.{ts,tsx,js,jsx}'
            // },
        }),
        new ESLintPlugin({
            context: src,
            exclude: ['node_modules', path.join(rootDir, './src/editor')],
            extensions: ['js', 'jsx', 'ts', 'tsx'],
        }),
    ],
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            configFile: path.join(rootDir, '/.babelrc.js'),
                        },
                    }
                ],
                exclude: /node_modules/,
            },
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: {
                    transpileOnly: true,
                },
                exclude: /node_modules/,
            },
            {
                test: /\.(html)$/,
                use: {
                    loader: 'html-loader',
                },
            },
            {
                test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.(woff(2)?|eot|ttf|otf|svg|)$/,
                type: 'asset/inline'
            },
        ]
    },
    resolve: {
        modules: [src, 'node_modules'],
        extensions: ['.tsx', '.ts', '.js', '.jsx', '.json'],
        alias: {
            '@components': path.join(rootDir, './src/components'),
            '@view': path.join(rootDir, './src/view'),
        },
        /* alias: {
            '@src': path.join(rootDir, '/src'),
            '@images': path.join(rootDir, '/src/images'),
            '@styles': path.join(rootDir, '/src/styles'),
            '@components': path.join(rootDir, '/src/components'),
        } */
    },
    /* optimization: {
        runtimeChunk: {
            name: 'runtime',
        },
        splitChunk: {
            cacheGroup: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendor',
                    chunks: 'initial',
                }
            }
        }
    },
    externals: {}, */
};
