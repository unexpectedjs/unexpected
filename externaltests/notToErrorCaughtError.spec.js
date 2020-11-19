const expect = require('../lib');

it('should foo', () => {
  return expect(function () {
    return expect.promise(function () {
      (function thisIsImportant() {
        throw new Error('argh');
      })();
    });
  }, 'not to error');
});
