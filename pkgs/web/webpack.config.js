const path = require('path')
const webpack = require('webpack')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");


const site = require('./site.js')
const rootDir = __dirname
const srcDir = path.join(rootDir, 'src')
const destDir = path.join(rootDir, 'dist')
const publicDir = path.join(rootDir, 'public')

const isDevelopment = process.env.NODE_ENV !== 'production'
const useAnalyze = !!process.env.WEBPACK_USE_ANALYZE
console.log('isDevelopment', isDevelopment)


let config = {
  entry: {
    index: path.join(srcDir, 'index.tsx'),
  },
  output: {
    path: destDir,
    filename: '[name].bundle.js',
    // publicPath: '/',  // this lets HtmlWebpackPlugin inject script with absolute path. Commonly used with react-router, in GitHub pages, it should not be used.
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              plugins: [
                'lodash',
                "@emotion/babel-plugin",
                isDevelopment && 'react-refresh/babel'
              ].filter(Boolean),
              presets: [
                ["@babel/preset-env", {
                  targets: {
                    browsers: '> 5%',  // this removes core-js
                  },
                  corejs: 3,
                  useBuiltIns: 'usage',
                }],
                "@babel/preset-typescript",
                ["@babel/preset-react", {
                  "runtime": "automatic",
                  "importSource": "@emotion/react",
                }]
              ],
            },
          },
        ],
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.scss$/i,
        use: [
          'style-loader',
          'css-loader',
          // 'css-modules-typescript-loader',
          // {
          //   loader: 'css-loader',
          //   options: {
          //     modules: true
          //   }
          // },
          'sass-loader',
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    plugins: [new TsconfigPathsPlugin()],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.APP_ENV': JSON.stringify(process.env.APP_ENV),
    }),
    new HtmlWebpackPlugin(Object.assign({
      inject: true,
      template: path.join(rootDir, 'index.html'),
    }, site)),
    new CopyPlugin({
      patterns: [
        { from: publicDir, to: destDir },
      ],
    }),
  ],
}



if (useAnalyze) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

  config.mode = 'development'
  config.plugins.push(
    new BundleAnalyzerPlugin({
      analyzerPort: 18888,
    })
  )
} else if (isDevelopment) {
  const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

  // only assign first level properties
  Object.assign(config, {
    devtool: 'cheap-module-source-map',
    mode: 'development',
    devServer: {
      host: '127.0.0.1',
      port: 3000,
      hot: true,
      historyApiFallback: true,
      // allowedHosts: [],  // add hosts here if you visite the site by a domain (e.g. from /etc/hosts)

      // add a proxy to
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8787/',
        }
      }
    },
  })
  config.plugins.push(
    new ReactRefreshWebpackPlugin(),
  )
} else {
  Object.assign(config, {
    mode: 'production',
    optimization: {
      minimize: true,
    }
  })
}

module.exports = config
