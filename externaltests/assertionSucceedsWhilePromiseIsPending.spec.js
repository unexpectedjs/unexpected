var expect = require('../lib');

expect.addAssertion('<any> to bar', (expect, subject) => {
  expect(subject, 'to equal', 'bar');
  return expect.promise((resolve, reject) => {});
});

expect.addAssertion('<any> to foo', expect => {
  expect('bar', 'to bar');
});

it('should call the callback', () => {
  expect('foo', 'to foo');
});
