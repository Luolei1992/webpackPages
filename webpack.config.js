const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin') // 清空打包目录的插件
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');
const proxyHost = "http://192.168.2.236:5050";

module.exports = {
  entry: {
    index: path.resolve(__dirname, 'src', 'index.js'),
    page: path.resolve(__dirname, 'src', 'page.js'),
  },
  output: {
    publicPath: '/', //这里要放的是静态资源CDN的地址
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].js'
  },
  resolve: {
    extensions: [".js", ".css", ".json"],
    alias: {} //配置别名可以加快webpack查找模块的速度
  },
  plugins: [
    // 多入口的html文件用chunks这个参数来区分
    new HtmlWebpackPlugin({
      title: 'index',
      template: path.resolve(__dirname, 'src/html', 'index.html'),
      filename: 'index.html',
      chunks: ['index', 'vendor','common'],
      inject: true,
      hash: true, //防止缓存
      minify: {
        removeAttributeQuotes: true, //压缩 去掉引号
        removeComments: true, //移除HTML中的注释
        collapseWhitespace: true //删除空白符与换行符
      }
    }),
    new HtmlWebpackPlugin({
      title: 'page',
      template: path.resolve(__dirname, 'src/html', 'page.html'),
      filename: 'page.html',
      chunks: ['page', 'vendor','common'],
      inject: true,
      hash: true, //防止缓存
      minify: {
        removeAttributeQuotes: true, //压缩 去掉引号
        removeComments: true, //移除HTML中的注释
        collapseWhitespace: true //删除空白符与换行符
      }
    }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: 'css/[name].css',
      chunkFilename: '[id].css',
    }),
    new CleanWebpackPlugin(),
  ],
  optimization: { //webpack4.x的最新优化配置项，用于提取公共代码
    splitChunks: {
      cacheGroups: {
        commons: {
          chunks: "initial",
          name: "common",
          minChunks: 2,
          maxInitialRequests: 5, // The default limit is too small to showcase the effect
          minSize: 0, // This is example is too small to create commons chunks
          reuseExistingChunk: true // 可设置是否重用该chunk（查看源码没有发现默认值）
        }
      }
    }
  },
  
  module: {
    // 多个loader是有顺序要求的，从右往左写，因为转换的时候是从右往左转换的
    rules: [
      {
        test: /\.js$/,
        use: "imports-loader?$=jquery"
      },
      {
        test: /\.css$/,
        use: [{
            loader: MiniCssExtractPlugin.loader,
            options: {
              // you can specify a publicPath here
              // by default it uses publicPath in webpackOptions.output
            },
          },
          'css-loader',
        ],
      },
      { //file-loader 解决css等文件中引入图片路径的问题
        // url-loader 当图片较小的时候会把图片BASE64编码，大于limit参数的时候还是使用file-loader 进行拷贝
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        use: {
          loader: 'url-loader',
          options: {
            outputPath: 'images/', // 图片输出的路径和存储路径保持一致
            limit: 100,
            name: '[name].[ext]'
          }
        }
      },
    ]
  },
  devtool: 'inline-source-map', //开发环境   //生产环境cheap-module-source-map
  devServer: {
    contentBase: path.join(__dirname, "dist"), //静态文件根目录
    proxy: {
      '/api': proxyHost
    },
    hot: true
  },
}