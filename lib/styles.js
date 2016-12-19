var utils = require('./utils');
var stringDiff = require('diff');
var specialCharRegExp = require('./specialCharRegExp');

module.exports = function (expect) {
    expect.installTheme({ styles: {
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
    }});

    expect.installTheme('html', {
        palette: [
            '#993333', '#669933', '#314575', '#337777', '#710071', '#319916',
            '#BB1A53', '#999933', '#4311C2', '#996633', '#993399', '#333399',
            '#228842', '#C24747', '#336699', '#663399'
        ],
        styles: {
            jsComment: '#969896',
            jsFunctionName: '#795da3',
            jsKeyword: '#a71d5d',
            jsPrimitive: '#0086b3',
            jsRegexp: '#183691',
            jsString: '#df5000',
            jsKey: '#555'
        }
    });

    expect.installTheme('ansi', {
        palette: [
            '#FF1A53', '#E494FF', '#1A53FF', '#FF1AC6', '#1AFF53', '#D557FF',
            '#81FF57', '#C6FF1A', '#531AFF', '#AFFF94', '#C61AFF', '#53FF1A',
            '#FF531A', '#1AFFC6', '#FFC61A', '#1AC6FF'
        ],
        styles: {
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
        }
    });

    expect.addStyle('colorByIndex', function (content, index) {
        var palette = this.theme().palette;
        if (palette) {
            var color = palette[index % palette.length];
            this.text(content, color);
        } else {
            this.text(content);
        }
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

    expect.addStyle('property', function (key, inspectedValue, isArrayLike) {
        var keyOmitted = false;
        var isSymbol;
        isSymbol = typeof key === 'symbol';
        if (isSymbol) {
            this.text('[').sp().appendInspected(key).sp().text(']').text(':');
        } else {
            key = String(key);
            if (/^[a-z\$\_][a-z0-9\$\_]*$/i.test(key)) {
                this.text(key, 'jsKey').text(':');
            } else if (/^(?:0|[1-9][0-9]*)$/.test(key)) {
                if (isArrayLike) {
                    keyOmitted = true;
                } else {
                    this.jsNumber(key).text(':');
                }
            } else {
                this.singleQuotedString(key).text(':');
            }
        }

        if (!inspectedValue.isEmpty()) {
            if (!keyOmitted) {
                if (key.length > 5 && inspectedValue.isBlock() && inspectedValue.isMultiline()) {
                    this.indentLines();
                    this.nl().i();
                } else {
                    this.sp();
                }
            }
            this.append(inspectedValue);
        }
    });

    // Intended to be redefined by a plugin that offers syntax highlighting:
    expect.addStyle('code', function (content, language) {
        this.text(content);
    });

    expect.addStyle('annotationBlock', function () {
        var pen = this.getContentFromArguments(arguments);
        var height = pen.size().height;

        this.block(function () {
            for (var i = 0; i < height; i += 1) {
                if (0 < i) {
                    this.nl();
                }
                this.error('//');
            }
        });
        this.sp().block(pen);
    });

    expect.addStyle('commentBlock', function () {
        var pen = this.getContentFromArguments(arguments);
        var height = pen.size().height;

        this.block(function () {
            for (var i = 0; i < height; i += 1) {
                if (0 < i) {
                    this.nl();
                }
                this.jsComment('//');
            }
        });
        this.sp().block(pen);
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

    expect.addStyle('stringDiffFragment', function (ch, text, baseStyle, markUpSpecialCharacters) {
        text.split(/\n/).forEach(function (line, i, lines) {
            if (this.isAtStartOfLine()) {
                this.alt({
                    text: ch,
                    fallback: function () {
                        if (line === '' && ch !== ' ' && (i === 0 || i !== lines.length - 1)) {
                            this[ch === '+' ? 'diffAddedSpecialChar' : 'diffRemovedSpecialChar']('\\n');
                        }
                    }
                });
            }
            var matchTrailingSpace = line.match(/^(.*[^ ])?( +)$/);
            if (matchTrailingSpace) {
                line = matchTrailingSpace[1] || '';
            }

            if (markUpSpecialCharacters) {
                line.split(specialCharRegExp).forEach(function (part) {
                    if (specialCharRegExp.test(part)) {
                        this[{'+': 'diffAddedSpecialChar', '-': 'diffRemovedSpecialChar'}[ch] || baseStyle](utils.escapeChar(part));
                    } else {
                        this[baseStyle](part);
                    }
                }, this);
            } else {
                this[baseStyle](line);
            }
            if (matchTrailingSpace) {
                this[{'+': 'diffAddedHighlight', '-': 'diffRemovedHighlight'}[ch] || baseStyle](matchTrailingSpace[2]);
            }
            if (i !== lines.length - 1) {
                this.nl();
            }
        }, this);
    });

    expect.addStyle('stringDiff', function (actual, expected, options) {
        options = options || {};
        var type = options.type || 'WordsWithSpace';
        var diffLines = [];
        var lastPart;
        stringDiff.diffLines(actual, expected).forEach(function (part) {
            if (lastPart && lastPart.added && part.removed) {
                diffLines.push({
                    oldValue: part.value,
                    newValue: lastPart.value,
                    replaced: true
                });
                lastPart = null;
            } else {
                if (lastPart) {
                    diffLines.push(lastPart);
                }
                lastPart = part;
            }
        });
        if (lastPart) {
            diffLines.push(lastPart);
        }

        diffLines.forEach(function (part, index) {
            if (part.replaced) {
                var oldValue = part.oldValue;
                var newValue = part.newValue;
                var newLine = this.clone();
                var oldEndsWithNewline = oldValue.slice(-1) === '\n';
                var newEndsWithNewline = newValue.slice(-1) === '\n';
                if (oldEndsWithNewline) {
                    oldValue = oldValue.slice(0, -1);
                }
                if (newEndsWithNewline) {
                    newValue = newValue.slice(0, -1);
                }
                stringDiff['diff' + type](oldValue, newValue).forEach(function (part) {
                    if (part.added) {
                        newLine.stringDiffFragment('+', part.value, 'diffAddedHighlight', options.markUpSpecialCharacters);
                    } else if (part.removed) {
                        this.stringDiffFragment('-', part.value, 'diffRemovedHighlight', options.markUpSpecialCharacters);
                    } else {
                        newLine.stringDiffFragment('+', part.value, 'diffAddedLine');
                        this.stringDiffFragment('-', part.value, 'diffRemovedLine');
                    }
                }, this);
                if (newEndsWithNewline && !oldEndsWithNewline) {
                    newLine.diffAddedSpecialChar('\\n');
                }

                if (oldEndsWithNewline && !newEndsWithNewline) {
                    this.diffRemovedSpecialChar('\\n');
                }
                this.nl().append(newLine).nl(oldEndsWithNewline && index < diffLines.length - 1 ? 1 : 0);
            } else {
                var endsWithNewline = /\n$/.test(part.value);
                var value = endsWithNewline ?
                    part.value.slice(0, -1) :
                    part.value;
                if (part.added) {
                    this.stringDiffFragment('+', value, 'diffAddedLine', options.markUpSpecialCharacters);
                } else if (part.removed) {
                    this.stringDiffFragment('-', value, 'diffRemovedLine', options.markUpSpecialCharacters);
                } else {
                    this.stringDiffFragment(' ', value, 'text');
                }
                if (endsWithNewline) {
                    this.nl();
                }
            }
        }, this);
    });

    expect.addStyle('arrow', function (options) {
        options = options || {};
        var styles = options.styles || [];
        var i;
        this.nl(options.top || 0).sp(options.left || 0).text('┌', styles);
        for (i = 1 ; i < options.width ; i += 1) {
            this.text(i === options.width - 1 && options.direction === 'up' ? '▷' : '─', styles);
        }
        this.nl();
        for (i = 1 ; i < options.height - 1 ; i += 1) {
            this.sp(options.left || 0).text('│', styles).nl();
        }
        this.sp(options.left || 0).text('└', styles);
        for (i = 1 ; i < options.width ; i += 1) {
            this.text(i === options.width - 1 && options.direction === 'down' ? '▷' : '─', styles);
        }
    });

    var flattenBlocksInLines = require('magicpen/lib/flattenBlocksInLines');
    expect.addStyle('merge', function (pens) {
        var flattenedPens = pens.map(function (pen) {
            return flattenBlocksInLines(pen.output);
        }).reverse();
        var maxHeight = flattenedPens.reduce(function (maxHeight, pen) {
            return Math.max(maxHeight, pen.length);
        }, 0);
        var blockNumbers = new Array(flattenedPens.length);
        var blockOffsets = new Array(flattenedPens.length);
        // As long as there's at least one pen with a line left:
        for (var lineNumber = 0 ; lineNumber < maxHeight ; lineNumber += 1) {
            if (lineNumber > 0) {
                this.nl();
            }
            var i;
            for (i = 0 ; i < blockNumbers.length ; i += 1) {
                blockNumbers[i] = 0;
                blockOffsets[i] = 0;
            }
            var contentLeft;
            do {
                contentLeft = false;
                var hasOutputChar = false;
                for (i = 0 ; i < flattenedPens.length ; i += 1) {
                    var currentLine = flattenedPens[i][lineNumber];
                    if (currentLine) {
                        while (currentLine[blockNumbers[i]] && blockOffsets[i] >= currentLine[blockNumbers[i]].args.content.length) {
                            blockNumbers[i] += 1;
                            blockOffsets[i] = 0;
                        }
                        var currentBlock = currentLine[blockNumbers[i]];
                        if (currentBlock) {
                            contentLeft = true;
                            if (!hasOutputChar) {
                                var ch = currentBlock.args.content.charAt(blockOffsets[i]);
                                if (ch !== ' ') {
                                    this.text(ch, currentBlock.args.styles);
                                    hasOutputChar = true;
                                }
                            }
                            blockOffsets[i] += 1;
                        }
                    }
                }
                if (!hasOutputChar && contentLeft) {
                    this.sp();
                }
            } while (contentLeft);
        }
    });

    expect.addStyle('arrowsAlongsideChangeOutputs', function (packing, changeOutputs) {
        if (packing) {
            var topByChangeNumber = {};
            var top = 0;
            changeOutputs.forEach(function (changeOutput, index) {
                topByChangeNumber[index] = top;
                top += changeOutput.size().height;
            });
            var that = this;

            var arrows = [];
            packing.forEach(function (columnSet, i, packing) {
                columnSet.forEach(function (entry) {
                    arrows.push(that.clone().arrow({
                        left: i * 2,
                        top: topByChangeNumber[entry.start],
                        width: 1 + (packing.length - i) * 2,
                        height: topByChangeNumber[entry.end] - topByChangeNumber[entry.start] + 1,
                        direction: entry.direction
                    }));
                });
            });

            if (arrows.length === 1) {
                this.block(arrows[0]);
            } else if (arrows.length > 1) {
                this.block(function () {
                    this.merge(arrows);
                });
            }
        } else {
            this.i();
        }

        this.block(function () {
            changeOutputs.forEach(function (changeOutput, index) {
                this.nl(index > 0 ? 1 : 0);
                if (!changeOutput.isEmpty()) {
                    this.sp(packing ? 1 : 0).append(changeOutput);
                }
            }, this);
        });
    });
};
