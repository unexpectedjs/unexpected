var expect = require('../lib');

it('should foo', () => {
  return expect(() => {
    return expect.promise(() => {
      (function thisIsImportant() {
        throw new Error('argh');
      })();
    });
  }, 'not to error');
});
