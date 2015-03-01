module.exports = function () {
    return function (files, metalsmith, next) {
        // delete .less files from the output
        Object.keys(files).filter(require('minimatch').filter("**/*.less", { matchBase: true })).forEach(function (file) {
            delete files[file];
        });
        next();
    };
};
