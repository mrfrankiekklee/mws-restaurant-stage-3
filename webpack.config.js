 var path = require('path');
 var webpack = require('webpack');
 module.exports = {
     entry: {
         dbhelper: './js/dbhelper.js',
         main: './js/main.js',
         app: './js/app.js',

     },
     output: {
         path: path.join(__dirname, 'build'),
         filename: '[name].js'
     },
     module: {
         rules: [
             {
                 test: /\.js$/,
                 loader: 'babel-loader',
                 query: {
                     presets: ['es2015']
                 }
             }
         ]
     },
     stats: {
         colors: true
     },
     devtool: 'source-map'
 };
