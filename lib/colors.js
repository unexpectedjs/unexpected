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
};
