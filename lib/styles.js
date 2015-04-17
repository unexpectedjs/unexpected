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
        diffRemovedHighlight: ['bgRed', 'black']
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

    expect.addStyle('shouldEqualError', function (expected, inspect) {
        this.error(typeof expected === 'undefined' ? 'should be' : 'should equal').sp().block(inspect(expected));
    });
};
