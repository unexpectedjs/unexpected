var expect = require('../lib').clone();

it('should fail', () => {
  expect.addAssertion('<any> to foo', function (expect, subject) {
    return expect.promise(function (resolve, reject) {
      setImmediate(function () {
        reject(new Error('argh'));
      });
    });
  });
  expect('bar', 'to foo');
});
