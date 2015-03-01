module.exports = function (options) {
    var autoprefixer = require('autoprefixer')(options);
    return function (files, metalsmith, next) {

        Object.keys(files).filter(require('minimatch').filter("**/*.css", { matchBase: true })).forEach(function (file, index, arr) {
            files[file].contents = new Buffer(autoprefixer.process(files[file].contents.toString()).css);
        });

        next();
    };
};
