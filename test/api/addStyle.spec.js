/*global expect*/
describe('addStyle', () => {
  var clonedExpect;
  beforeEach(function() {
    clonedExpect = expect.clone();
  });

  it('is chainable (returns the expect function, not the magicpen instance)', () => {
    clonedExpect.addStyle('foo', function() {})('bar', 'to equal', 'bar');
  });
});
