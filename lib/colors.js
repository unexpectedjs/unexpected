module.exports = function (expect) {
    expect.output.addStyle('error', function (content) {
        this.text(content, 'red, bold');
    });
    expect.output.addStyle('strings', function (content) {
        this.text(content, '#CC7200');
    });
    expect.output.addStyle('key', function (content) {
        this.text(content);
    });
    // Intended to be redefined by a plugin that offers syntax highlighting:
    expect.output.addStyle('code', function (content, language) {
        this.text(content);
    });
};
