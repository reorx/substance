const webpack = require('webpack')
const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const ExtReloader = require('@reorx/webpack-ext-reloader')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const { merge } = require('webpack-merge')

const rootDir = path.resolve(__dirname)
const srcDir = path.join(rootDir, 'src')
const destDir = path.join(rootDir, 'dist')

console.log('srcDir', srcDir)

const common = {
  entry: {
    // background keeps the extension auto reloading, please don't remove it
    background: path.join(srcDir, 'background.ts'),
    content_script: path.join(srcDir, 'content_script.ts'),
    content_style: path.join(srcDir, 'content_style.scss'),
    inject: path.join(srcDir, 'inject.ts'),

    // react pages:
    popup: path.join(srcDir, 'popup.tsx'),
    options: path.join(srcDir, 'options.tsx'),
    extractor: path.join(srcDir, 'extractor.tsx'),
  },
  output: {
    path: destDir,
    filename: 'js/[name].js',
  },
  optimization: {
    // https://webpack.js.org/plugins/split-chunks-plugin/
    splitChunks: {
        name: "vendor",
        chunks(chunk) {
          switch (chunk.name) {
            case 'background':
              return false;
            case 'content_script':
              return false;
            default:
              return true;
          }
        }
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          projectReferences: true,
        }
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        oneOf: [
          // For "css" in "content_scripts", generate separate files
          // https://stackoverflow.com/a/67307684/596206
          {
            test: /content_.+\.scss$/i,
            use: [
              'sass-loader',
            ],
            type: 'asset/resource',
            generator: {
              filename: 'css/[name].css'
            }
          },
          {
            test: /\.scss$/i,
            use: [
              'style-loader',
              'css-loader',
              'sass-loader',
            ],
          },
        ]
      }
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    plugins: [new TsconfigPathsPlugin()],
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: path.join(rootDir, 'public'), to: destDir }],
    }),
  ],
}


function developmentConfig() {
  console.log('development config')
  const config = merge(common, {
    // `eval` could not be used, see https://stackoverflow.com/questions/48047150/chrome-extension-compiled-by-webpack-throws-unsafe-eval-error
    devtool: 'cheap-module-source-map',
    mode: 'development',
    plugins: [
      /*
      new ExtReloader({
        entries: {
          background: 'background',
          // contentScript: ['content_script', 'content_style'],
          extensionPage: ['extractor'],
        },
      }),
      */
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      }),
    ],
  })

  if (process.env.MEASURE_SPEED) {
    const SpeedMeasurePlugin = require("speed-measure-webpack-plugin")
    const smp = new SpeedMeasurePlugin()
    config = smp.wrap(config)
  }
  return config
}


function productionConfig() {
  console.log('production config')
  const config = merge(common, {
    mode: 'production',
    plugins: [
      new webpack.DefinePlugin({
        'process.env.APP_ENV': JSON.stringify(process.env.APP_ENV),
      }),
    ],
  })
  return config
}


module.exports = process.env.NODE_ENV === 'production' ? productionConfig() : developmentConfig()
