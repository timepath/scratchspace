const webpack = require("webpack")
const path = require("path")
const fs = require("fs")
function fixpath(it) {
    return path.join(__dirname, it)
}

const VERBOSE = false
const NODE_ENV = process.env.NODE_ENV = (process.env.NODE_ENV || "development")
const OPTIMIZE = NODE_ENV === "production"

/**
 * TODO:
 * electron
 * react blessed
 * react native
 * tint2
 */
const configs = {
    server: {
        ext: "server",
        target: "node",
        entry: "src/main",
        output: {path: "build", filename: "server.js"},
        run: function (it) {
            global["bundler"] = configs.web && configs.web.compiler
            require(it)
        }
    },
    web: {
        ext: "web",
        watch: false,
        target: "web",
        entry: "src/main",
        output: {path: "static", filename: "browser.js", publicPath: "/"}
    },
    nw: {
        ext: "nw",
        _hot: false,
        target: "node-webkit",
        entry: "src/main",
        output: {path: "build", filename: "nw.js"}
    }
}

const common = {
    devtool: "#source-map",
    watch: true,
    _hot: true,
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
        new webpack.NoErrorsPlugin()
    ],
    resolve: {extensions: ["", ".tsx", ".ts", ".jsx", ".js"]},
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
        configuration: require(fixpath("tslint")),
        emitErrors: true,
        failOnHint: true
    }
}

if (OPTIMIZE) {
    common.plugins.push(new webpack.DefinePlugin({
        "process.env.NODE_ENV": "'" + NODE_ENV + "'"
    }))

    common.plugins.push(new webpack.optimize.AggressiveMergingPlugin())
    common.plugins.push(new webpack.optimize.DedupePlugin())
    common.plugins.push(new webpack.optimize.OccurrenceOrderPlugin(true))
    common.plugins.push(new webpack.optimize.UglifyJsPlugin({compress: {warnings: false}, mangle: true}))
}

Object.keys(configs).forEach(function (it) {
    console.log("building %s", it)
    function deepClone(obj) {
        return require('clone')(obj)
    }

    const conf = configs[it] = deepClone(Object.assign({}, common, configs[it]))
    conf.output.path = fixpath(conf.output.path)
    conf.output.filename = conf.output.filename || "bundle.js"
    conf.entry = fixpath(conf.entry)
    var x = []
    conf.resolve.extensions.forEach(function (it) {
        if (!it) return;
        x.push(('.' + conf.ext) + it);
    })
    conf.resolve.extensions = x.concat(conf.resolve.extensions);
    if (conf._hot) {
        conf.plugins.push(new webpack.HotModuleReplacementPlugin())
        conf.module.loaders.unshift({test: /\.(j|t)sx?$/, loader: "react-hot-loader", exclude: /node_modules/});
    }

    if (conf.target === "node") {
        conf.entry = ["webpack/hot/poll?1000", conf.entry]
    } else if (conf.target === "web") {
        conf.entry = ["webpack-hot-middleware/client", conf.entry]
    } else if (conf.target === "node-webkit") {
        conf.devtool = undefined;
    }
    if (conf.target === "node" && !OPTIMIZE) {
        // use system modules
        const nodeModules = {}
        fs.readdirSync("node_modules")
            .filter(function (it) {
                return [".bin"].indexOf(it) === -1
            })
            .forEach(function (it) {
                nodeModules[it] = "commonjs " + it
            })
        conf.externals = conf.externals || []
        conf.externals.push(nodeModules)
    }
    const compiler = conf.compiler = webpack(conf)
    if (!conf.watch) return
    compiler.watch({}, function (err, stats) {
        console.log(stats.toString(conf.stats))
        if (err) return console.log(err)
        if (stats.toJson().errors.length) return
        const p = conf.output.path + "/" + conf.output.filename
        if (conf.run) {
            console.log("running %s", p)
            conf.run(p)
        }
    })
})
