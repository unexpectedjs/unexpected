var expect = require('../');

expect.addAssertion('<any> to bar', function (expect, subject) {
    expect(subject, 'to equal', 'bar');
    return expect.promise(function (resolve, reject) {});
});

expect.addAssertion('<any> to foo', function (expect) {
    expect('bar', 'to bar');
});

it('should call the callback', function () {
    expect('foo', 'to foo');
});
