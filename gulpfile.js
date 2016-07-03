var gulp = require("gulp");

gulp.task("default", ["webpack", "nwjs"]);

gulp.task("webpack", function (callback) {
    callback();
    require("./main");
});

var NwBuilder = require('nw-builder');
var nw = new NwBuilder({
    files: './src/nw/**',
    platforms: ['win', 'osx', 'linux'],
    version: '0.12.3'
});
nw.on('log', console.log);

gulp.task("nwjs", function () {
    nw.build().then(function () {
        console.log('all done!');
    }).catch(function (error) {
        console.error(error);
    });
});
