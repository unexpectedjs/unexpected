module.exports = function (expect) {
    expect.output.addStyle('error', function (content) {
        this.text(content, 'red', 'bold');
    });
    expect.output.addStyle('success', function (content) {
        this.text(content, 'green', 'bold');
    });
    expect.output.addStyle('strings', function (content) {
        this.text(content, '#00A0A0');
    });
    expect.output.addStyle('key', function (content) {
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
    expect.output.addStyle('number', function (content) {
        this.text(content);
    });
    expect.output.addStyle('comment', function (content) {
        this.gray(content);
    });
    expect.output.addStyle('regexp', function (content) {
        this.green(content);
    });
    expect.output.addStyle('diffAddedLine', function (content) {
        this.text(content, 'green');
    });
    expect.output.addStyle('diffAddedHighlight', function (content) {
        this.text(content, 'bgGreen', 'white');
    });
    expect.output.addStyle('diffAddedSpecialChar', function (content) {
        this.text(content, 'bgGreen', 'cyan', 'bold');
    });
    expect.output.addStyle('diffRemovedLine', function (content) {
        this.text(content, 'red');
    });
    expect.output.addStyle('diffRemovedHighlight', function (content) {
        this.text(content, 'bgRed', 'white');
    });
    expect.output.addStyle('diffRemovedSpecialChar', function (content) {
        this.text(content, 'bgRed', 'cyan', 'bold');
    });
    // Intended to be redefined by a plugin that offers syntax highlighting:
    expect.output.addStyle('code', function (content, language) {
        this.text(content);
    });

    expect.output.addStyle('annotationBlock', function () {
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
