const utils = require('./utils');
const unifiedDiff = require('./unifiedDiff');
const stringDiff = require('diff');
const specialCharRegExp = require('./specialCharRegExp');

module.exports = expect => {
  expect.installTheme({
    styles: {
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
    }
  });

  expect.installTheme('html', {
    palette: [
      '#993333',
      '#669933',
      '#314575',
      '#337777',
      '#710071',
      '#319916',
      '#BB1A53',
      '#999933',
      '#4311C2',
      '#996633',
      '#993399',
      '#333399',
      '#228842',
      '#C24747',
      '#336699',
      '#663399'
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
      '#FF1A53',
      '#E494FF',
      '#1A53FF',
      '#FF1AC6',
      '#1AFF53',
      '#D557FF',
      '#81FF57',
      '#C6FF1A',
      '#531AFF',
      '#AFFF94',
      '#C61AFF',
      '#53FF1A',
      '#FF531A',
      '#1AFFC6',
      '#FFC61A',
      '#1AC6FF'
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

  expect.addStyle('colorByIndex', function(content, index) {
    const palette = this.theme().palette;
    if (palette) {
      const color = palette[index % palette.length];
      this.text(content, color);
    } else {
      this.text(content);
    }
  });

  expect.addStyle('singleQuotedString', function(content) {
    content = String(content);
    this.jsString("'")
      .jsString(
        // eslint-disable-next-line no-control-regex
        content.replace(/[\\\x00-\x1f']/g, $0 => {
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
            const charCode = $0.charCodeAt(0);
            return `\\x${charCode < 16 ? '0' : ''}${charCode.toString(16)}`;
          }
        })
      )
      .jsString("'");
  });

  expect.addStyle('propertyForObject', function(
    key,
    inspectedValue,
    isArrayLike
  ) {
    let keyOmitted = false;
    let isSymbol;
    isSymbol = typeof key === 'symbol';
    if (isSymbol) {
      this.text('[')
        .appendInspected(key)
        .text(']')
        .text(':');
    } else {
      key = String(key);
      if (/^[a-z$_][a-z0-9$_]*$/i.test(key)) {
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
        if (
          key.length > 5 &&
          inspectedValue.isBlock() &&
          inspectedValue.isMultiline()
        ) {
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
  expect.addStyle('code', function(content, language) {
    this.text(content);
  });

  expect.addStyle('annotationBlock', function(...args) {
    const pen = this.getContentFromArguments(args);
    const height = pen.size().height;

    this.block(function() {
      for (let i = 0; i < height; i += 1) {
        if (i > 0) {
          this.nl();
        }
        this.error('//');
      }
    });
    this.sp().block(pen);
  });

  expect.addStyle('commentBlock', function(...args) {
    const pen = this.getContentFromArguments(args);
    const height = pen.size().height;

    this.block(function() {
      for (let i = 0; i < height; i += 1) {
        if (i > 0) {
          this.nl();
        }
        this.jsComment('//');
      }
    });
    this.sp().block(pen);
  });

  expect.addStyle('removedHighlight', function(content) {
    this.alt({
      text() {
        content.split(/(\n)/).forEach(function(fragment) {
          this.block(function() {
            this.text(fragment.replace(/\n/g, '\\n'))
              .nl()
              .text(fragment.replace(/[\s\S]/g, '^'));
          });
          if (fragment === '\n') {
            this.nl();
          }
        }, this);
      },
      fallback() {
        content.split(/(\n)/).forEach(fragment => {
          if (fragment === '\n') {
            this.diffRemovedSpecialChar('\\n').nl();
          } else {
            this.diffRemovedHighlight(fragment);
          }
        });
      }
    });
  });

  expect.addStyle('match', function(content) {
    this.alt({
      text() {
        content.split(/(\n)/).forEach(function(fragment) {
          if (fragment === '\n') {
            this.nl();
          } else {
            this.block(function() {
              this.text(fragment)
                .nl()
                .text(fragment.replace(/[\s\S]/g, '^'));
            });
          }
        }, this);
      },
      fallback() {
        this.diffAddedHighlight(content);
      }
    });
  });

  expect.addStyle('partialMatch', function(content) {
    this.alt({
      text() {
        // We haven't yet come up with a good styling for partial matches in text mode
        this.match(content);
      },
      fallback() {
        this.partialMatchHighlight(content);
      }
    });
  });

  expect.addStyle('shouldEqualError', function(expected) {
    this.error(typeof expected === 'undefined' ? 'should be' : 'should equal')
      .sp()
      .block(function() {
        this.appendInspected(expected);
      });
  });

  expect.addStyle('errorName', function({ name, constructor }) {
    if (typeof name === 'string' && name !== 'Error') {
      this.text(name);
    } else if (constructor && typeof constructor.name === 'string') {
      this.text(constructor.name);
    } else {
      this.text('Error');
    }
  });

  expect.addStyle('appendErrorMessage', function(error, options) {
    if (error && error.isUnexpected) {
      this.append(
        error.getErrorMessage(utils.extend({ output: this }, options))
      );
    } else {
      this.appendInspected(error);
    }
  });

  expect.addStyle('appendItems', function(items, separator) {
    const that = this;
    separator = separator || '';
    items.forEach((item, index) => {
      if (index > 0) {
        that.append(separator);
      }
      that.appendInspected(item);
    });
  });

  const stringDiffFallbacks = {
    diffAddedHighlight: 'diffAddedLine',
    diffRemovedHighlight: 'diffRemovedLine'
  };

  expect.addStyle('stringDiffFragment', function(
    ch,
    line,
    baseStyle,
    markUpSpecialCharacters,
    outputOpts = {}
  ) {
    const { forceHighlight } = outputOpts;
    const isChangedNewline = line === '' && ch !== ' ';

    this.alt({
      text() {
        if (forceHighlight) {
          this[ch === '+' ? 'diffAddedLine' : 'diffRemovedLine']('\\n');
        }
        if (!forceHighlight) {
          this.raw(ch);
        }
      },
      fallback() {
        if (isChangedNewline) {
          this[ch === '+' ? 'diffAddedSpecialChar' : 'diffRemovedSpecialChar'](
            '\\n'
          );
        }
      }
    });

    let outputStyle = this[baseStyle]
      ? baseStyle
      : stringDiffFallbacks[baseStyle];

    if (line.length > 0) {
      if (markUpSpecialCharacters) {
        line.split(specialCharRegExp).forEach(part => {
          if (specialCharRegExp.test(part)) {
            this[
              { '+': 'diffAddedSpecialChar', '-': 'diffRemovedSpecialChar' }[
                ch
              ] || outputStyle
            ](utils.escapeChar(part));
          } else {
            this[outputStyle](part);
          }
        });
      } else {
        this[outputStyle](line);
      }
    }
  });

  expect.addStyle('stringDiff', function(actual, expected, options = {}) {
    const changes = stringDiff.diffLines(actual, expected);

    let sawFirst = false;
    let sawNewline = false;

    const drawNewline = () => {
      sawNewline = true;
      this.nl();
    };

    unifiedDiff(changes, (ch, value, outputOpts = {}) => {
      const { leadingNewline = true, trailingNewline = true } = outputOpts;

      if (!sawFirst) {
        sawFirst = true;
      } else if (leadingNewline) {
        drawNewline();
      }

      let matchTrailingSpace = null;
      if (ch === '+' || ch === '-') {
        matchTrailingSpace = value.match(/^(.*[^ ])?( +)$/);
        if (matchTrailingSpace) {
          this.stringDiffFragment(
            ch,
            matchTrailingSpace[2],
            ch === '+' ? 'diffAddedHighlight' : 'diffRemovedHighlight',
            options.markUpSpecialCharacters
          );
          return;
        }
      }

      if (ch === '+') {
        this.stringDiffFragment(
          '+',
          value,
          'diffAddedLine',
          options.markUpSpecialCharacters,
          outputOpts
        );
      } else if (ch === '>') {
        this.stringDiffFragment(
          '+',
          value,
          'diffAddedHighlight',
          options.markUpSpecialCharacters,
          outputOpts
        );
      } else if (ch === '-') {
        this.stringDiffFragment(
          '-',
          value,
          'diffRemovedLine',
          options.markUpSpecialCharacters,
          outputOpts
        );
      } else if (ch === '<') {
        this.stringDiffFragment(
          '-',
          value,
          'diffRemovedHighlight',
          options.markUpSpecialCharacters,
          outputOpts
        );
      } else if (ch === '~') {
        this.jsComment('...');
      } else {
        this.stringDiffFragment(' ', value, 'text');
      }

      if (ch !== '~' && value.length === 0 && trailingNewline) {
        drawNewline();
      }
    });

    if (!sawNewline) {
      this.nl();
    }
  });

  expect.addStyle('arrow', function(options = {}) {
    const styles = options.styles || [];
    let i;
    this.nl(options.top || 0)
      .sp(options.left || 0)
      .text('┌', styles);
    for (i = 1; i < options.width; i += 1) {
      this.text(
        i === options.width - 1 && options.direction === 'up' ? '▷' : '─',
        styles
      );
    }
    this.nl();
    for (i = 1; i < options.height - 1; i += 1) {
      this.sp(options.left || 0)
        .text('│', styles)
        .nl();
    }
    this.sp(options.left || 0).text('└', styles);
    for (i = 1; i < options.width; i += 1) {
      this.text(
        i === options.width - 1 && options.direction === 'down' ? '▷' : '─',
        styles
      );
    }
  });

  const flattenBlocksInLines = require('magicpen/lib/flattenBlocksInLines');
  expect.addStyle('merge', function(pens) {
    const flattenedPens = pens
      .map(({ output }) => flattenBlocksInLines(output))
      .reverse();
    const maxHeight = flattenedPens.reduce(
      (maxHeight, { length }) => Math.max(maxHeight, length),
      0
    );
    const blockNumbers = new Array(flattenedPens.length);
    const blockOffsets = new Array(flattenedPens.length);
    // As long as there's at least one pen with a line left:
    for (let lineNumber = 0; lineNumber < maxHeight; lineNumber += 1) {
      if (lineNumber > 0) {
        this.nl();
      }
      let i;
      for (i = 0; i < blockNumbers.length; i += 1) {
        blockNumbers[i] = 0;
        blockOffsets[i] = 0;
      }
      let contentLeft;
      do {
        contentLeft = false;
        let hasOutputChar = false;
        for (i = 0; i < flattenedPens.length; i += 1) {
          const currentLine = flattenedPens[i][lineNumber];
          if (currentLine) {
            while (
              currentLine[blockNumbers[i]] &&
              blockOffsets[i] >=
                currentLine[blockNumbers[i]].args.content.length
            ) {
              blockNumbers[i] += 1;
              blockOffsets[i] = 0;
            }
            const currentBlock = currentLine[blockNumbers[i]];
            if (currentBlock) {
              contentLeft = true;
              if (!hasOutputChar) {
                const ch = currentBlock.args.content.charAt(blockOffsets[i]);
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

  expect.addStyle('arrowsAlongsideChangeOutputs', function(
    packing,
    changeOutputs
  ) {
    if (packing) {
      const topByChangeNumber = {};
      let top = 0;
      changeOutputs.forEach((changeOutput, index) => {
        topByChangeNumber[index] = top;
        top += changeOutput.size().height;
      });
      const that = this;

      const arrows = [];
      packing.forEach((columnSet, i, { length }) => {
        columnSet.forEach(({ start, end, direction }) => {
          arrows.push(
            that.clone().arrow({
              left: i * 2,
              top: topByChangeNumber[start],
              width: 1 + (length - i) * 2,
              height: topByChangeNumber[end] - topByChangeNumber[start] + 1,
              direction
            })
          );
        });
      });

      if (arrows.length === 1) {
        this.block(arrows[0]);
      } else if (arrows.length > 1) {
        this.block(function() {
          this.merge(arrows);
        });
      }
    } else {
      this.i();
    }

    this.block(function() {
      changeOutputs.forEach(function(changeOutput, index) {
        this.nl(index > 0 ? 1 : 0);
        if (!changeOutput.isEmpty()) {
          this.sp(packing ? 1 : 0).append(changeOutput);
        }
      }, this);
    });
  });
};
