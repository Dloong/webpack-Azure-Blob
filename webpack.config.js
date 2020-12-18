const path = require('path')
const DemoPlugin = require('./plugin/pluginDemo.js')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const dotenv = require('dotenv')
dotenv.config()

module.exports = {
  entry: {
    main: './src/main.js',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'js/[name]_[hash:8].js',
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        loader: 'babel-loader',
      },
      {
        test: /\.css$/,
        use:[MiniCssExtractPlugin.loader, 'css-loader']
      },
      {
        test: /.(png|jpg|jpeg|gif|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'images/[name]_[hash:8].[ext]',
              publicPath: 'https://silotsg.blob.core.windows.net/bbb-public/',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, './public/index.html'),
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css'
    }),
    new DemoPlugin({
      connection: {
        connectionString: process.env.CONNECTION_STRING,
      },
      accountName: process.env.ACCOUNTNAME,
      containerName: process.env.CONTAINNERNAME,
      dir: path.resolve(__dirname, './dist'),
    })
  ],
}
