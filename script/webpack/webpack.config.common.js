const path = require('path');
// const chalk = require('chalk');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const ForTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const { ProvidePlugin, DefinePlugin, /* DllPlugin, */ DllReferencePlugin, webpack, } = require('webpack');

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
    cache: {
        // 使用文件缓存
        type: 'filesystem',
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Editor',
            inject: 'body',
            filename: 'index.html',
            template: path.join(rootDir, './script/webpack', './index.html'),
        }),
        new ProvidePlugin({}),
        new DefinePlugin({
            /* 'process.env': {
                NODE_ENV: JSON.stringify(mode),
            }, */
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
        // new DllPlugin({
        //     name: '[name].manifest.json',
        //     path: path.resolve(rootDir, "./dll/[name].manifest.json"),
        // }),
        // new DllReferencePlugin({
        //     context: rootDir,
        //     manifest: path.resolve(rootDir, "./dll/main.manifest.json"),
        // }),
        // 关联 dll 文件
        new DllReferencePlugin({
            context: rootDir,
            manifest: path.resolve(rootDir, "./dll/react.manifest.json"),
        }),
        // 将 dll 文件插入到 html 中
        new AddAssetHtmlPlugin({
            filepath: path.resolve(rootDir, './dll/react.dll.js'),
        }),
        // 进度条
        new ProgressBarPlugin({
            format: `  :msg [:bar] :percent (:elapsed s)`
        })
        // new DllReferencePlugin({
        //     context: rootDir,
        //     manifest: path.resolve(rootDir, "./dll/runtime.manifest.json"),
        // }),
    ],
    module: {
        rules: [
            /* {
                test: /\.(js|jsx)$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            configFile: path.join(rootDir, '/.babelrc.js'),
                        },
                    }
                ],
                include: src,
                exclude: /node_modules/,
            },
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: {
                    transpileOnly: true,
                },
                include: src,
                exclude: [
                    /node_modules/,
                    path.join(src, './editor/__test__'),
                    // path.join(src, './editor/spec'),
                    path.join(src, './toastmark/__test__'),
                    path.join(src, './toastmark/__sample__'),
                    path.join(src, './toastmark/html/__test__'),
                ],
            }, */
            {
                test: /\.(html)$/,
                use: {
                    loader: 'html-loader',
                },
                include: [src, path.join(__dirname, 'script')],
            },
            {
                test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
                type: 'asset/resource',
                include: src,
            },
            {
                test: /\.(woff(2)?|eot|ttf|otf|svg|)$/,
                type: 'asset/inline',
                include: src,
            },
            {
                test: /\.(js|jsx)$/,
                loader: 'esbuild-loader',
                options: {
                    loader: 'jsx',
                    target: 'es2015',
                },
                include: src,
            },
            /* {
                loader: 'thread-loader',
                options: {
                    workerParallelJobs: 2
                },
                include: src,
                exclude: [
                    /node_modules/,
                ],
            }, */
            {
                test: /\.tsx?$/,
                loader: 'esbuild-loader',
                options: {
                    loader: 'tsx',
                    target: 'es2015',
                    // tsconfigRaw: require('../../tsconfig.json'),
                },
                include: src,
                exclude: [
                    /node_modules/,
                    path.join(src, './editor/__test__'),
                    // path.join(src, './editor/spec'),
                    path.join(src, './toastmark/__test__'),
                    path.join(src, './toastmark/__sample__'),
                    path.join(src, './toastmark/html/__test__'),
                ],
            },
        ]
    },
    resolve: {
        modules: [src, 'node_modules'],
        extensions: ['.tsx', '.ts', '.js', '.jsx', '.json'],
        alias: {
            '@': path.join(rootDir, './src/editor'),
            '@toastmark': path.join(rootDir, './src/toastmark'),
            '@editorType': path.join(rootDir, './src/@types/editor'),
            '@toastmarkType': path.join(rootDir, './src/@types/toastmark'),
            '@pluginHighlightType': path.join(rootDir, './src/@types/code-syntax-highlight'),
            // 做一下临时兼容
            '@t': path.join(rootDir, './src/@types/editor'),
            '@toast': path.join(rootDir, './src/@types/toastmark'),
            '@codeType': path.join(rootDir, './src/@types/code-syntax-highlight'),

            '@code': path.join(rootDir, './src/editorPlugins/code-syntax-highlight'),
            '@components': path.join(rootDir, './src/components'),
            '@view': path.join(rootDir, './src/view'),
        },
        // 如果你不使用 symlinks（例如 npm link 或者 yarn link），可以设置 false
        symlinks: false,
    },
    optimization: {
        moduleIds: 'deterministic',
        runtimeChunk: {
            name: 'runtime',
        },
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendor',
                    chunks: 'all',
                }
            }
        }
    },
    // externals: {},
};
