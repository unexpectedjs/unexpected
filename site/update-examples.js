var async = require('async');
var passError = require('passerror');
var glob = require('glob');
var fs = require('fs');
var Path = require('path');
var expect = require('../lib/');

var examplesToEvaluateRegex = /(?:<!-- ?evaluate ?-->)[\s\S]*?<!-- ?\/evaluate ?-->/gm;

var assertionsPath = Path.resolve(__dirname, '..', 'documentation');

async.waterfall([
    glob.bind(null, assertionsPath + '/*/*.md'),
    function (files, callback) {
        async.map(files, function (file, callback) {
            fs.readFile(file, passError(callback, function (data) {
                callback(null, {
                    name: file,
                    content: data.toString()
                });
            }));
        }, callback);
    },
    function (files, callback) {
        var examplesToUpdate = [];
        files.forEach(function (file) {
            var examples = file.content.match(examplesToEvaluateRegex) || [];
        	examples.forEach(function (example) {
                var parts = (example.match(/```[\s\S]*?```/gm) || []).map(function (part) {
                    var partResult = {
                        fullText: part
                    };

                    partResult.type = part.match(/^```([a-z]+)/);
                    if (partResult.type) {
                        partResult.type = partResult.type.pop();
                    }

                    partResult.body = part.replace(/^```.*[\n]/m, '')
            							  .replace(/\n```$/m, '');

                    return partResult;
                });

                if (
                    parts.length === 2 &&
                    (parts[0].type === 'javascript' && parts[1].type === null) ||
                    (parts[0].type === null && parts[1].type === 'javascript')
                ) {
                    var code, output;
                    if (parts[0].type === 'javascript') {
                        code = parts[0];
                        output = parts[1];
                    } else {
                        code = parts[1];
                        output = parts[0];
                    }

                    examplesToUpdate.push({
                        filename: file.name,
                        fullText: example,
                        output: output,
                        code: code
                    });
                }
            });
        });

        callback(null, examplesToUpdate);
    },
    function (examplesToUpdate, callback) {
        async.eachSeries(examplesToUpdate, function (example, callback) {
            var textOutput = example.output.body;

            var testFailed = false;

            try {
                eval(example.code.body);
            } catch (e) {
                testFailed = true;
                textOutput = e.output.toString('text');
            }

            if (!testFailed) {
                return callback(new Error([
                    'No errors were thrown when evaluating example in: ',
                    '       ' + example.filename,
                    '',
                    example.code.body,
                    ''
                ].join('\n')));
            }


            if (textOutput !== example.output.body) {
                var replacement = example.fullText.replace(example.output.body, textOutput);
                return fs.readFile(example.filename, passError(callback, function (data) {
                    data = data.toString().replace(example.fullText, replacement);
                    fs.writeFile(example.filename, data, passError(callback, function () {
                        console.log('Updated example in', example.filename);
                        callback();
                    }));
                }));
            } else {
                return callback();
            }
        }, callback);
    }
], function (err) {
    if (err) {
        throw err;
    }

    console.log('Done!');
});
