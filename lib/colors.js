module.exports = function (expect) {
    expect.output.addStyle('error', function (content) {
        this.text(content, 'red, bold');
    });
    expect.output.addStyle('strings', function (content) {
        this.text(content, '#00A0A0');
    });
    expect.output.addStyle('key', function (content) {
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
        this.text(content, 'bgGreen, white');
    });
    expect.output.addStyle('diffAddedSpecialChar', function (content) {
        this.text(content, 'bgGreen, cyan, bold');
    });
    expect.output.addStyle('diffRemovedLine', function (content) {
        this.text(content, 'red');
    });
    expect.output.addStyle('diffRemovedHighlight', function (content) {
        this.text(content, 'bgRed, white');
    });
    expect.output.addStyle('diffRemovedSpecialChar', function (content) {
        this.text(content, 'bgRed, cyan, bold');
    });
    // Intended to be redefined by a plugin that offers syntax highlighting:
    expect.output.addStyle('code', function (content, language) {
        this.text(content);
    });

};
