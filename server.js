var browserSync = require('browser-sync');
var webpack = require('webpack');
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');

var webpackConfig = require('./webpack.config');
var bundler = webpack(webpackConfig);

browserSync({
    server: {
        baseDir: 'app',
        middleware: [
            webpackDevMiddleware(bundler, {
                publicPath: webpackConfig.output.publicPath,
                stats: webpackConfig.stats
            }),
            webpackHotMiddleware(bundler),
            function (req, res, next) {
                if (req.headers.accept.startsWith('text/html')) {
                    req.url = '/index.html';
                }
                next();
            }
        ]
    },
    files: [
        'app/*.html'
    ]
});
