const expect = require('../lib');

it('should call the callback', () => {
  expect(function () {}, 'to call the callback');
  expect(true, 'to be falsy');
});
