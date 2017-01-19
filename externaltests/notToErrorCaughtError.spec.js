var expect = require('../');

it('should foo', function () {
    return expect(function () {
        return expect.promise(function () {
            (function thisIsImportant() {
                throw new Error('argh');
            }());
        });
    }, 'not to error');
});
