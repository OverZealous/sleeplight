'use strict';

const ENV = process.env.npm_lifecycle_event;
const isProd = ENV === 'build';

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');

module.exports = (function makeWebpackConfig() {
	const config = {};

	config.entry = {
		app: './client-src/app/app.js'
	};

	config.output = {
		path: path.resolve(__dirname, './client'),
		publicPath: '/',
		filename: isProd ? '[name].[hash].js' : '[name].bundle.js',
		chunkFilename: isProd ? '[name].[hash].js' : '[name].bundle.js'
	};

	const extractCSS = new ExtractTextPlugin(isProd ? '[name].[contenthash].css' : '[name].bundle.css');

	if(isProd) {
		config.devtool = 'source-map';
	} else {
		config.devtool = 'eval-source-map';
	}

	config.resolve = {
		modules: [
			'node_modules',
			'client-src/public/',
		]
	};

	config.module = {
		loaders: [
			{
				test: /\.js$/,
				use: ['ng-annotate-loader', 'babel-loader'],
				exclude: /node_modules/
			},
			{
				test: /\.less$/,
				use: extractCSS.extract([
					{
						loader: 'css-loader',
						options: {
							importLoaders: 1,
						},
					},
					'postcss-loader',
					'less-loader',
				]),
			},
			{
				test: /\.(png|jpg|jpeg|gif|woff|woff2|ttf|eot)$/,
				use: ['file-loader'],
			},
			{
				test: /\.svg$/,
				use: [
					'file-loader',
					{
						loader: 'svgo-loader',
						options: {
							plugins: [
								{ removeTitle: true },
							]
						}
					}
				],
			},
			{
				test: /\.tpl.html$/,
				use: [
					'html-loader'
				],
			}
		]
	};

	config.plugins = [
		extractCSS,
		new HtmlWebpackPlugin({
			template: './client-src/public/index.html',
			inject: 'body'
		}),
		new HtmlWebpackPlugin({
			filename: '404.html',
			template: './client-src/public/404.html',
			inject: 'body'
		}),
		new HtmlWebpackPlugin({
			filename: '500.html',
			template: './client-src/public/500.html',
			inject: 'body'
		}),
	];

	if(isProd) {
		config.plugins.push(
			new webpack.optimize.UglifyJsPlugin({
				sourceMap: true,
				warning: true,
			}),
			new CopyWebpackPlugin([
					{ from: path.resolve(__dirname, './client-src/public') }
				],
				{ ignore: ['index.html', '404.html', '500.html'] })
		);
	}

	config.devServer = {
		contentBase: './client-src/public',
		stats: 'minimal',
		disableHostCheck: true,
		historyApiFallback: true,

		proxy: {
			'/api': {
				target: 'http://localhost:8000',
				secure: false,
			},
			'/socket.io': {
				target: 'http://localhost:8000',
				secure: false,
			},
		},
	};

	return config;
}());

