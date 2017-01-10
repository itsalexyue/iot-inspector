var ExtractTextPlugin = require("extract-text-webpack-plugin");
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');
var webpack = require('webpack');

module.exports = {
  name: 'client',
  devtool: 'cheap-module-source-map',
  entry: [
    path.join(__dirname, 'client.js'),
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    // publicPath: '/public/javascripts',
    filename: 'bundle.js'
  },
  module: {
    preLoaders: [
      {
      test: /\.json$/,
      loader: 'json-loader',
    }
    ],
    loaders: [
      //  {
      //  test: /(\.pug|\.jade)/,
      //  loader: 'pug-loader'
      //},
      {
        test: /\.jsx?/,
        loader: 'babel-loader',
        exclude: /(node_modules|internal_modules|bower_components|scripts)/,
        query: {
          presets: ['es2015', 'react', 'stage-0'],
        }
      }, {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract("style-loader" ,"css-loader"),
      }]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      inject: false,
      title: 'Web Page',
      template: path.join(__dirname, './views/webpack.handlebars')
    })
  ]
};