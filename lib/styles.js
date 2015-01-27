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
        diffRemovedSpecialChar: ['bgRed', 'cyan', 'bold']
    });

    expect.installTheme('html', {
        jsComment: '#969896',
        jsFunctionName: '#795da3',
        jsKeyword: '#a71d5d',
        jsPrimitive: '#0086b3',
        jsRegexp: 'jsString',
        jsString: '#df5000',
        jsKey: '#555'
    });

    expect.installTheme('ansi', {
        jsComment: 'gray',
        jsFunctionName: 'jsKeyword',
        jsKeyword: 'magenta',
        jsNumber: 'jsPrimitive',
        jsPrimitive: 'cyan',
        jsRegexp: 'green',
        jsString: 'cyan',
        jsKey: '#666',
        diffAddedHighlight: ['green', 'inverse'],
        diffRemovedHighlight: ['red', 'inverse']
    });

    expect.addStyle('key', function (content) {
        content = String(content);
        if (/^[a-z\$\_][a-z0-9\$\_]*$/i.test(content)) {
            this.text(content, 'jsKey');
        } else if (/^(?:0|[1-9][0-9]*)$/.test(content)) {
            this.jsNumber(content);
        } else {
            this.jsString('\'')
                .jsString(JSON.stringify(content).replace(/^"|"$/g, '')
                         .replace(/'/g, "\\'")
                         .replace(/\\"/g, '"'))
                .jsString('\'');

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
                    this.error('// ');
                }
            });
            this.block(pen);
        }
    });

};
