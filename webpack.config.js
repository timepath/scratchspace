var webpack = require("webpack");
var path = require("path");

var DEBUG = process.env.NODE_ENV === "development";
var VERBOSE = false;

var config = {
    context: path.join(__dirname, "src"),
    entry: ["./main"],
    output: {
        path: path.join(__dirname, "app"),
        publicPath: "/",
        filename: "js/bundle.js"
    },
    debug: DEBUG,
    devtool: DEBUG ? "#eval-source-map" : false,
    stats: {
        colors: true,
        reasons: DEBUG,
        hash: VERBOSE,
        version: VERBOSE,
        timings: true,
        chunks: VERBOSE,
        chunkModules: VERBOSE,
        cached: VERBOSE,
        cachedAssets: VERBOSE
    },
    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.NoErrorsPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': DEBUG ? '"development"' : '"production"',
            __DEV__: DEBUG
        })
    ],
    resolve: {
        extensions: ["", ".tsx", ".ts", ".js"]
    },
    module: {
        preLoaders: [
            {
                test: /\.tsx?$/,
                loader: "tslint"
            }
        ],
        loaders: [
            {
                test: /\.(j|t)sx?$/,
                loader: "react-hot-loader",
                include: path.join(__dirname, "src"),
                exclude: /(node_modules|bower_components)/
            },
            {
                test: /\.(j|t)sx?$/,
                loader: "babel-loader",
                query: {
                    presets: ["react", "es2015"]
                }
            },
            {
                test: /\.tsx?$/,
                loader: "ts-loader"
            },
            {
                test: /\.css$/,
                loaders: ["style-loader", "css-loader"]
            }
        ]
    },
    tslint: {
        configuration: require("./tslint.json"),
        emitErrors: true,
        failOnHint: true
    }
};

if (DEBUG) {
    config.entry.unshift(
        "webpack/hot/dev-server",
        "webpack-hot-middleware/client"
    );
    config.plugins.push(new webpack.HotModuleReplacementPlugin());
}

if (!DEBUG) {
    config.plugins.push(new webpack.optimize.DedupePlugin());
    config.plugins.push(new webpack.optimize.UglifyJsPlugin({compress: {warnings: false}, mangle: true}));
    config.plugins.push(new webpack.optimize.AggressiveMergingPlugin());
}

module.exports = config;
