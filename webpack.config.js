var webpack = require('webpack');

var PROD = JSON.parse(process.env.PROD_ENV || '0');

module.exports = {
   entry: './src/Game.ts',
   output: {
     filename: 'bundle.js',
 },
 module: {
     rules: [
     {
         test: /\.tsx?$/,
         loader: 'ts-loader',
         exclude: /node_modules/,
     },
     {
         enforce: 'pre',
         test: /\.js$/,
         loader: "source-map-loader"
     },
     {
         enforce: 'pre',
         test: /\.tsx?$/,
         use: "source-map-loader"
     }
     ],
     loaders: [
        // all files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'
        { test: /\.tsx?$/, loader: "ts-loader" }
        ]
    },
    resolve: {
     extensions: [".tsx", ".ts", ".js"]
 },

 devtool: 'inline-source-map',

 plugins: PROD ? [
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false }
    })
  ] : [],

};
