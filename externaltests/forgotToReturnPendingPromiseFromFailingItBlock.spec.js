var expect = require('../lib');

it('should call the callback', () => {
  expect(() => {}, 'to call the callback');
  expect(true, 'to be falsy');
});
