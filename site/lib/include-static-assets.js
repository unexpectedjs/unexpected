var async = require('async');
var mode = require('stat-mode');
var glob = require('glob');
var fs = require('fs');
var passError = require('passerror');

module.exports = function includeStaticAssets(options) {
    options = options || {};
    options.path = options.path || 'static';
    options.destination = options.destination || 'static';

    return function (files, metalsmith, next) {
        glob('**/*', { cwd: options.path }, passError(next, function (staticFiles) {
            var staticFiles = staticFiles.map(function (file) {
                return require('path').resolve(options.path, file);
            });

            async.map(staticFiles, function (file, cb) {
                async.waterfall([
                    function (cb) {
                        fs.stat(file, passError(cb, function (data) {
                            var fileObj = {};
                            fileObj.stats = data;
                            fileObj.mode = mode(data).toOctal();
                            return cb(null, fileObj);
                        }));
                    },
                    function (fileObj, cb) {
                        fs.readFile(file, passError(cb, function (data) {
                            fileObj.contents = data;
                            return cb(null, fileObj);
                        }));
                    }
                ], cb);
            }, passError(next, function (staticFilesContent) {
                var staticFilesObj = staticFiles.reduce(function (filesObj, file, index) {
                    filesObj[file] = staticFilesContent[index];
                    return filesObj;
                }, {});

                Object.keys(staticFilesObj).forEach(function (staticFile) {
                    var relative = staticFile.replace(options.path, '');
                    if (relative[0] !== '/') {
                        relative = '/' + relative;
                    }
                    relative = options.destination + relative;
                    files[relative] = staticFilesObj[staticFile];
                });

                return next();
            }));
        }));
    };
};
