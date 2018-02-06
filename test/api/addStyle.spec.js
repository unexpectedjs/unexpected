/*global expect*/
describe('addStyle', function() {
  var clonedExpect;
  beforeEach(function() {
    clonedExpect = expect.clone();
  });

  it('is chainable (returns the expect function, not the magicpen instance)', function() {
    clonedExpect.addStyle('foo', function() {})('bar', 'to equal', 'bar');
  });
});
