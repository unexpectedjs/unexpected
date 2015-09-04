var utils = require('./utils');

module.exports = function (expect) {
    expect.installTheme({
        jsBoolean: 'jsPrimitive',
        jsNumber: 'jsPrimitive',
        error: ['red', 'bold'],
        success: ['green', 'bold'],
        diffAddedLine: 'green',
        diffAddedHighlight: ['bgGreen', 'white'],
        diffAddedSpecialChar: ['bgGreen', 'cyan', 'bold'],
        diffRemovedLine: 'red',
        diffRemovedHighlight: ['bgRed', 'white'],
        diffRemovedSpecialChar: ['bgRed', 'cyan', 'bold'],
        partialMatchHighlight: ['bgYellow']
    });

    expect.installTheme('html', {
        jsComment: '#969896',
        jsFunctionName: '#795da3',
        jsKeyword: '#a71d5d',
        jsPrimitive: '#0086b3',
        jsRegexp: '#183691',
        jsString: '#df5000',
        jsKey: '#555'
    });

    expect.installTheme('ansi', {
        jsComment: 'gray',
        jsFunctionName: 'jsKeyword',
        jsKeyword: 'magenta',
        jsNumber: [],
        jsPrimitive: 'cyan',
        jsRegexp: 'green',
        jsString: 'cyan',
        jsKey: '#666',
        diffAddedHighlight: ['bgGreen', 'black'],
        diffRemovedHighlight: ['bgRed', 'black'],
        partialMatchHighlight: ['bgYellow', 'black']
    });

    expect.addStyle('singleQuotedString', function (content) {
        content = String(content);
        this.jsString("'")
            .jsString(content.replace(/[\\\x00-\x1f']/g, function ($0) {
                if ($0 === '\n') {
                    return '\\n';
                } else if ($0 === '\r') {
                    return '\\r';
                } else if ($0 === "'") {
                    return "\\'";
                } else if ($0 === '\\') {
                    return '\\\\';
                } else if ($0 === '\t') {
                    return '\\t';
                } else if ($0 === '\b') {
                    return '\\b';
                } else if ($0 === '\f') {
                    return '\\f';
                } else {
                    var charCode = $0.charCodeAt(0);
                    return '\\x' + (charCode < 16 ? '0' : '') + charCode.toString(16);
                }
            }))
            .jsString("'");
    });

    expect.addStyle('key', function (content) {
        content = String(content);
        if (/^[a-z\$\_][a-z0-9\$\_]*$/i.test(content)) {
            this.text(content, 'jsKey');
        } else if (/^(?:0|[1-9][0-9]*)$/.test(content)) {
            this.jsNumber(content);
        } else {
            this.singleQuotedString(content);
        }
    });

    // Intended to be redefined by a plugin that offers syntax highlighting:
    expect.addStyle('code', function (content, language) {
        this.text(content);
    });

    expect.addStyle('annotationBlock', function () {
        var pen = this.getContentFromArguments(arguments);
        var height = pen.size().height;

        if (height > 0) {
            this.block(function () {
                for (var i = 0; i < height; i += 1) {
                    if (0 < i) {
                        this.nl();
                    }
                    this.error('//');
                }
            });
            this.sp().block(pen);
        }
    });

    expect.addStyle('commentBlock', function () {
        var pen = this.getContentFromArguments(arguments);
        var height = pen.size().height;

        if (height > 0) {
            this.block(function () {
                for (var i = 0; i < height; i += 1) {
                    if (0 < i) {
                        this.nl();
                    }
                    this.jsComment('//');
                }
            });
            this.sp().block(pen);
        }
    });

    expect.addStyle('removedHighlight', function (content) {
        this.alt({
            text: function () {
                content.split(/(\n)/).forEach(function (fragment) {
                    if (fragment === '\n') {
                        this.nl();
                    } else {
                        this.block(function () {
                            this.text(fragment).nl().text(fragment.replace(/[\s\S]/g, '^'));
                        });
                    }
                }, this);
            },
            fallback: function () {
                this.diffRemovedHighlight(content);
            }
        });
    });

    expect.addStyle('match', function (content) {
        this.alt({
            text: function () {
                content.split(/(\n)/).forEach(function (fragment) {
                    if (fragment === '\n') {
                        this.nl();
                    } else {
                        this.block(function () {
                            this.text(fragment).nl().text(fragment.replace(/[\s\S]/g, '^'));
                        });
                    }
                }, this);
            },
            fallback: function () {
                this.diffAddedHighlight(content);
            }
        });
    });

    expect.addStyle('partialMatch', function (content) {
        this.alt({
            text: function () {
                // We haven't yet come up with a good styling for partial matches in text mode
                this.match(content);
            },
            fallback: function () {
                this.partialMatchHighlight(content);
            }
        });
    });

    expect.addStyle('shouldEqualError', function (expected) {
        this.error(typeof expected === 'undefined' ? 'should be' : 'should equal').sp().block(function () {
            this.appendInspected(expected);
        });
    });

    expect.addStyle('errorName', function (error) {
        if (typeof error.name === 'string' && error.name !== 'Error') {
            this.text(error.name);
        } else if (error.constructor && typeof error.constructor.name === 'string') {
            this.text(error.constructor.name);
        } else {
            this.text('Error');
        }
    });

    expect.addStyle('appendErrorMessage', function (error, options) {
        if (error && error.isUnexpected) {
            this.append(error.getErrorMessage(utils.extend({ output: this }, options)));
        } else {
            this.appendInspected(error);
        }
    });

    expect.addStyle('appendItems', function (items, separator) {
        var that = this;
        separator = separator || '';
        items.forEach(function (item, index) {
            if (0 < index) {
                that.append(separator);
            }
            that.appendInspected(item);
        });
    });

    expect.addStyle('magicPenLine', function (line, pen) {
        line.forEach(function (lineEntry, j) {
            if (j > 0) {
                this.nl();
            }
            if (lineEntry.style === 'text') {
                var styles = lineEntry.args.styles;
                if (pen && styles.length === 1 && typeof pen[styles[0]] === 'function') {
                    // Text with a single style also available as a method on the pen being inspected:
                    this
                        .text('.')
                        .jsFunctionName(styles[0])
                        .text('(')
                        .singleQuotedString(lineEntry.args.content)
                        .text(')');
                } else {
                    this
                        .text('.')
                        .jsFunctionName('text')
                        .text('(')
                        .singleQuotedString(lineEntry.args.content);
                    if (styles.length > 0) {
                        this
                            .text(', ')
                            .appendInspected(styles.length === 1 && Array.isArray(styles[0]) ? styles[0] : styles);
                    }
                    this.text(')');
                }
            } else {
                // lineEntry.style === 'block'
                this
                    .text('.')
                    .jsFunctionName('block').text('(').jsKeyword('function').text(' () {');
                if (lineEntry.args) {
                    this
                        .nl()
                        .indentLines()
                        .i()
                        .magicPen(pen, lineEntry.args)
                        .outdentLines()
                        .nl();
                }
                this.text('})');
            }
        }, this);
    });

    expect.addStyle('magicPen', function (pen, lines) {
        var isTopLevel = !lines;
        lines = lines || pen.output;
        this.block(function () {
            if (isTopLevel) {
                this.jsFunctionName('magicpen').text('(');
                if (pen.format) {
                    this.singleQuotedString(pen.format);
                }
                this.text(')');
            } else {
                this.jsKeyword('this');
            }
            if (!pen.isEmpty()) {
                var inspectOnMultipleLines = lines.length > 1 || lines[0].length > 1;
                if (inspectOnMultipleLines) {
                    this
                        .nl()
                        .indentLines()
                        .i();
                }
                this.block(function () {
                    lines.forEach(function (line, i) {
                        if (i > 0) {
                            this.text('.').jsFunctionName('nl').text('()').nl();
                        }
                        this.magicPenLine(line, pen);
                    }, this);
                    if (!isTopLevel) {
                        this.text(';');
                    }
                });
                if (inspectOnMultipleLines) {
                    this.outdentLines();
                }
            }
        });

        // If we're at the top level of a non-empty pen compatible with the current output,
        // render the output of the pen in a comment:
        if (isTopLevel && !pen.isEmpty() && (pen.format === this.format || !pen.format)) {
            this.sp().commentBlock(pen);
        }
    });
};
