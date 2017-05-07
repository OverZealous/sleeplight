'use strict';

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const extractCSS = new ExtractTextPlugin('[name].bundle.css');
const path = require('path');
const ENV = process.env.npm_lifecycle_event;
const isProd = ENV === 'build';

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

	if(isProd) {
		config.devtool = 'source-map';
	} else {
		config.devtool = 'eval-source-map';
	}

	config.resolve = {
		modules: [
			'node_modules',
		]
	};

	config.module = {
		loaders: [{
			test: /\.js$/,
			use: ['ng-annotate-loader', 'babel-loader'],
			exclude: /node_modules/
		}, {
			test: /\.less$/,
			use: extractCSS.extract([
				'css-loader',
				{
					loader: 'pleeease-loader',
					options: {
						autoprefixer: { browsers: ["last 4 versions", "ios 6"] },
						minifier: true,
						sourcemaps: true,
					},
				},
				'less-loader',
			]),
		}, {
			test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
			use: ['file-loader'],
		}, {
			test: /\.tpl.html$/,
			use: [
				'html-loader'
			],
		}]
	};

	config.plugins = [];

	config.plugins.push(
		extractCSS,
		new HtmlWebpackPlugin({
			template: './client-src/public/index.html',
			inject: 'body'
		})
	);

	if(isProd) {
		config.plugins.push(
			new webpack.optimize.UglifyJsPlugin({
				sourceMap: true,
				warning: true,
			}),
			new CopyWebpackPlugin([
					{ from: path.resolve(__dirname, './client-src/public') }
				],
				{ ignore: ['index.html'] })
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
			}
		},
	};

	return config;
}());

