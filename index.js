#!/usr/bin/env node

const webpack = require("webpack");
const path = require("path");
const fs = require("fs");

const target = "server";
const VERBOSE = false;
const PORT = 8080;
const NODE_ENV = process.env.NODE_ENV = (process.env.NODE_ENV || "development");
const BROWSER_SYNC = true;
const OPTIMIZE = NODE_ENV === "production";

// TODO:
// nwjs
// electron
// react blessed
// react native
// tint2
const modes = {
    server: {
        target: "node",
        main: "src/_server",
        path: "build",
        bundle: NODE_ENV !== "development"
    },
    web: {target: "web", main: "src/_web", path: "src", publicPath: "/", bundle: true}
}
const mode = modes[target];

const webpackConfig = module.exports = {
    entry: [path.join(__dirname, mode.main)],
    target: mode.target,
    output: {
        path: path.join(__dirname, mode.path),
        publicPath: mode.publicPath
    },
    devtool: "#source-map",
    stats: {
        colors: true,
        assets: true,
        version: false,
        timings: false,
        hash: false,
        chunks: VERBOSE,
        warnings: true,
        errors: true,
        errorDetails: true
    },
    bail: false,
    plugins: [
        new webpack.NoErrorsPlugin(),
        new webpack.HotModuleReplacementPlugin()
    ],
    resolve: {extensions: [".js", "", ".tsx", ".ts", ".jsx", ".css"]},
    module: {
        preLoaders: [
            {test: /\.tsx?$/, loader: "tslint", exclude: /node_modules/}
        ],
        loaders: [
            {
                test: /\.jsx?$/,
                loader: "babel-loader",
                query: {cacheDirectory: true, presets: ["react", "es2015"]},
                exclude: /node_modules/
            },
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                exclude: /node_modules/
            },
            {test: /\.css$/, loaders: ["style-loader", "css-loader"], exclude: /node_modules/}
        ]
    },
    tslint: {
        configuration: require("./tslint"),
        emitErrors: true,
        failOnHint: true
    }
};

if (mode == modes.web) {
    webpackConfig.module.loaders.unshift({test: /\.(j|t)sx?$/, loader: "react-hot-loader", exclude: /node_modules/});
}

if (mode == modes.server) webpackConfig.entry.unshift("webpack/hot/poll?1000");
if (mode == modes.web) webpackConfig.entry.unshift("webpack-hot-middleware/client");

if (OPTIMIZE) {
    webpackConfig.plugins.push(new webpack.DefinePlugin({
        "process.env.NODE_ENV": "'" + NODE_ENV + "'"
    }));

    webpackConfig.plugins.push(new webpack.optimize.AggressiveMergingPlugin());
    webpackConfig.plugins.push(new webpack.optimize.DedupePlugin());
    webpackConfig.plugins.push(new webpack.optimize.OccurrenceOrderPlugin());
    webpackConfig.plugins.push(new webpack.optimize.UglifyJsPlugin({compress: {warnings: false}, mangle: true}));
}

if (!mode.bundle) {
    // use system modules
    const nodeModules = {};
    fs.readdirSync("node_modules")
        .filter(function (it) {
            return [".bin"].indexOf(it) === -1;
        })
        .forEach(function (it) {
            nodeModules[it] = "commonjs " + it;
        });
    webpackConfig.externals = nodeModules;
}

const bundler = webpack(webpackConfig);

if (mode == modes.server) {
    var fn = function (err, stats) {
        console.log(stats.toString(webpackConfig.stats));
        if (err) return console.log(err);
        if (stats.toJson().errors.length) return;
        require("./build/bundle");
    };
    bundler.watch({}, fn)
}

if (mode == modes.web) {
    const middleware = [];
    middleware.push(require("compression")());
    middleware.push(require("webpack-dev-middleware")(bundler, {
        publicPath: webpackConfig.output.publicPath,
        stats: webpackConfig.stats
    }));
    middleware.push(require("webpack-hot-middleware")(bundler));
    const express = require("express");
    middleware.push(express.static(mode.path));
    middleware.push(require("express-history-api-fallback")("index.html", {root: mode.path}))

    const app = express();
    middleware.forEach(function (it) {
        app.use(it);
    })
    app.listen(PORT - (BROWSER_SYNC ? 1 : 0), "localhost");

    if (BROWSER_SYNC) {
        const browserSync = require("browser-sync");
        const bs = browserSync.create();
        bs.init({
            ui: {port: (PORT + 1)},
            proxy: {target: "http://localhost:" + (PORT - 1), ws: true},
            port: PORT,
            tunnel: true, // bool | string
            open: false,
            xip: true, // vhost support
            reloadOnRestart: true,
            notify: false
        });
    }
}
