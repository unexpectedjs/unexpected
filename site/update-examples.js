/* global global */

// TODO share the code between this file and metalsmith-unexpected-markdown.js

var async = require('async');
var passError = require('passerror');
var glob = require('glob');
var fs = require('fs');
var Path = require('path');
var expect = require('../lib/').clone();
expect.output.preferredWidth = 80;
var vm = require('vm');
var extend = require('../lib/utils').extend;

var documentationPath = Path.resolve(__dirname, '..', 'documentation');
var codeBlockRegexp = /^```(\S+)\n([\s\S]*?)\n```/gm;

function parseFlags(flagsString) {
    var flags = {};
    flagsString.split(/,/).forEach(function (flagString) {
        var m = /(\w+):(\w+)/.exec(flagString);
        flags[m[1]] = m[2] === 'true';
    });
    return flags;
}

function parseBlockInfo(lang) {
    var m = /^(\w+)#(\w+:\w+(,\w+:\w+)*)/.exec(lang);
    var flags = { evaluate: true };
    if (m) {
        lang = m[1];
        extend(flags, parseFlags(m[2]));
    }

    if (lang === 'js') {
        lang = 'javascript';
    }

    return {
        lang: lang,
        flags: flags
    };
}

function isPromise(value) {
    return value &&
        typeof value.then === 'function' &&
        typeof value.caught === 'function';
}

function evaluateExamples(expect, codeBlocks, cb) {
    var oldGlobal = extend({}, global);
    global.expect = expect.clone();

    async.eachSeries(codeBlocks, function (codeBlock, cb) {
        if (codeBlock.lang === 'javascript' && codeBlock.flags.evaluate) {
            try {
                if (codeBlock.flags.async) {
                    var promise = vm.runInThisContext(
                        '(function () { ' +
                            codeBlock.code +
                            '})();'
                    );
                    if (!isPromise(promise)) {
                        throw new Error('Async code block did not return a promise or throw\n' + codeBlock.code);
                    }
                    promise.then(function () {
                        cb();
                    }).caught(function (e) {
                        codeBlock.error = e;
                        cb();
                    });
                } else {
                    vm.runInThisContext(codeBlock.code);
                    cb();
                }
            } catch (e) {
                codeBlock.error = e;
                cb();
            }
        } else {
            cb();
        }
    }, function () {
        Object.keys(global).forEach(function (key) {
            if (!(key in oldGlobal)) {
                delete global[key];
            }
        });
        extend(global, oldGlobal);
        cb();
    });
}

function extractCodeSnippets(content, cb) {
    var codeBlocks = [];
    content.replace(codeBlockRegexp, function ($0, lang, code) {
        var codeBlock = parseBlockInfo(lang);
        codeBlock.code = code;
        codeBlocks.push(codeBlock);
    });
    return codeBlocks;
}

function updateCodeBlocks(content, codeBlocks) {
    var index = 0;
    return content.replace(codeBlockRegexp, function ($0, lang, code) {
        var currentIndex = index;
        index += 1;
        var codeBlock = codeBlocks[currentIndex];
        if (codeBlock.lang === 'output') {
            var exampleBlock = codeBlocks[currentIndex - 1];
            var output = '';
            if (exampleBlock && exampleBlock.lang === 'javascript') {
                var error = exampleBlock.error;
                if (error) {
                    output = error.output ? error.output.toString() : error.message;
                }
            }
            return '```' + lang + '\n' + output + '\n```';
        } else {
            return $0;
        }
    });
}

async.waterfall([
    glob.bind(null, documentationPath + '/**/*.md'),
    function (filePaths, callback) {
        async.map(filePaths, function (file, callback) {
            fs.readFile(file, passError(callback, function (data) {
                callback(null, {
                    name: file,
                    content: data.toString()
                });
            }));
        }, callback);
    },
    function (files, callback) {
        async.mapSeries(files, function (file, cb) {
            var codeBlocks = extractCodeSnippets(file.content);
            evaluateExamples(expect.clone(), codeBlocks, function () {
                cb(null, {
                    name: file.name,
                    content: updateCodeBlocks(file.content, codeBlocks)
                });
            });
        }, callback);
    },
    function (files, callback) {
        async.each(files, function (file, cb) {
            fs.writeFile(file.name, file.content, 'utf8', cb);
        }, callback);
    }
], function (err) {
    if (err) {
        throw err;
    }

    console.log('Done!');
});
