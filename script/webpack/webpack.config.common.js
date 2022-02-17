const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const ForTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
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
        new DllReferencePlugin({
            context: rootDir,
            manifest: path.resolve(rootDir, "./dll/react.manifest.json"),
        }),
        new AddAssetHtmlPlugin({
            filepath: path.resolve(rootDir, './dll/react.dll.js'),
        }),
        // new DllReferencePlugin({
        //     context: rootDir,
        //     manifest: path.resolve(rootDir, "./dll/runtime.manifest.json"),
        // }),
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
            },
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
        ]
    },
    resolve: {
        modules: [src, 'node_modules'],
        extensions: ['.tsx', '.ts', '.js', '.jsx', '.json'],
        alias: {
            '@': path.join(rootDir, './src/editor'),
            '@t': path.join(rootDir, './src/@types'),
            '@toast': path.join(rootDir, './src/toastmark/@types'),
            '@codeType': path.join(rootDir, './src/editorPlugins/code-syntax-highlight/@types'),
            '@code': path.join(rootDir, './src/editorPlugins/code-syntax-highlight'),
            '@components': path.join(rootDir, './src/components'),
            '@view': path.join(rootDir, './src/view'),
            '@toast-ui': path.join(rootDir, './src'),
        },
        // 如果你不使用 symlinks（例如 npm link 或者 yarn link），可以设置 false
        // symlinks: false,
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
