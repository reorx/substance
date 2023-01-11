const path = require('path')
const glob = require('glob')

module.exports = {
  target: 'node',
  entry: {
    'main': './src/index.ts',
    'extractors': glob.sync('./src/extractors/*.ts'),
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    library: {
      type: 'umd',
    }
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  optimization: {
    minimize: false,
    nodeEnv: false,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ]
  }
}
