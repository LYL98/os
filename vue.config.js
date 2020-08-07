const WebpackBar = require('webpackbar');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackTagsPlugin = require('html-webpack-tags-plugin');

const isProd = process.env.NODE_ENV === 'production';
const deploy_env = process.env.DEPLOY_ENV;
const isLib = process.argv[process.argv.length - 1] === 'lib';

module.exports = {
  outputDir: '../dist',
  productionSourceMap: false,
  configureWebpack: {
    resolve: {
      mainFields: ['main'], // 只采用main字段作为入口文件描述字段，减少搜索步骤
    },
    externals: {
      'vue': 'Vue',
      // 'pgyos': 'pgyos'
    },
    optimization: {
      minimize: isProd, // 开发环境不压缩
      splitChunks: {
        chunks: 'async', // 共有三个值可选：initial(初始模块)、async(按需加载模块)和all(全部模块)
        minSize: 30000, // 模块超过30k自动被抽离成公共模块
        minChunks: 1, // 模块被引用>=1次，便分割
        maxAsyncRequests: 5,  // 异步加载chunk的并发请求数量<=5
        maxInitialRequests: 3, // 一个入口并发加载的chunk数量<=3
        name: true, // 默认由模块名+hash命名，名称相同时多个模块将合并为1个，可以设置为function
        automaticNameDelimiter: '~', // 命名分隔符
        cacheGroups: { // 缓存组，会继承和覆盖splitChunks的配置
          default: {
            minChunks: 2, // 模块被引用>=2次，拆分至vendors公共模块
            priority: -20, // 优先级
            reuseExistingChunk: true, // 默认使用已有的模块
          },
        },
      },
    },
    plugins: [
      // 生产环境下: 1、显示打包进度条，2、打包结束后，替换之前的打包文件
      ...(isProd ? [
        new WebpackBar(),
        new CleanWebpackPlugin(['../dist'], {
          allowExternal: true,
          beforeEmit: true,
        }),
      ] : []),

      ...(!isLib ? [

        new HtmlWebpackTagsPlugin({
          useHash: isProd,
          links: ['css/pg-ui.css']
        }),

        // 将js文件自动添加到html文件中
        new HtmlWebpackTagsPlugin({
          useHash: false, // 是否在打包时，添加hash
          tags: ['js/vue.esm.js'], // 添加的资源相对html的路径
          append: false, // false 在其他资源的之前添加 true 在其他资源之后添加
        }),

        // sentry scripts
        new HtmlWebpackTagsPlugin({
          useHash: false,
          tags: [
            'js/popper-core.min.js',
            'js/lodop-func.js',
            'ckeditor/ckeditor.js',
            'js/sentry.bundle.js'
          ],
          append: true,
        }),
      ] : []),

    ],
  },
  css: {
    extract: false,
  },
};
