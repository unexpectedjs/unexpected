var expect = require('../lib');

it('should fail', () => {
  expect.addAssertion('<any> to foo', (expect, subject) => {
    return expect.promise((resolve, reject) => {
      setImmediate(() => {
        reject(new Error('argh'));
      });
    });
  });
  expect('bar', 'to foo');
});
