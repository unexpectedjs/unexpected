module.exports = function (expect) {
    expect.installTheme({
        strings: '#00A0A0',
        number: [],
        comment: 'gray',
        regexp: 'green'
    });

    expect.installTheme({
        error: ['red', 'bold'],
        success: ['green', 'bold'],
        diffAddedLine: 'green',
        diffAddedHighlight: ['bgGreen', 'white'],
        diffAddedSpecialChar: ['bgGreen', 'cyan', 'bold'],
        diffRemovedLine: 'red',
        diffRemovedHighlight: ['bgRed', 'white'],
        diffRemovedSpecialChar: ['bgRed', 'cyan', 'bold']
    });

    expect.addStyle('key', function (content) {
        content = String(content);
        if (/^[a-z\$\_][a-z0-9\$\_]*$/i.test(content)) {
            this.text(content, '#666');
        } else if (/^(?:0|[1-9][0-9]*)$/.test(content)) {
            this.number(content);
        } else {
            this.strings('\'')
                .strings(JSON.stringify(content).replace(/^"|"$/g, '')
                         .replace(/'/g, "\\'")
                         .replace(/\\"/g, '"'))
                .strings('\'');

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

    expect.addStyle('shouldEqualError', function (expected, inspect) {
        this.error(typeof expected === 'undefined' ? 'should be' : 'should equal').sp().block(inspect(expected));
    });
};
