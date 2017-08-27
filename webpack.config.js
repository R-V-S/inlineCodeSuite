const path = require('path')

module.exports = {
  entry: './src/index',
  output: {
    path: path.resolve('./dist'),
    filename: 'inline-code-suite.js',
    library: 'InlineCodeSuite',
    libraryTarget: 'umd'
  },
  module: {
    rules: [{
      test: /\.js$/,
      use: [{
        loader: 'babel-loader',
        options: {
          presets: ['env']
        }
      }]
    },
    {
      test: /\.scss$|\.css$/,
      use: ['style-loader','css-loader','sass-loader']
    }]
  },
  resolve: {
    modules: ['node_modules', path.resolve(__dirname, 'app')],
    extensions: ['.js', '.css']
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './examples',
    publicPath: '/',
  }

}
