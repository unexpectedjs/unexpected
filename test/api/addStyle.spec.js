/*global expect*/
describe('addStyle', () => {
  var clonedExpect;
  beforeEach(() => {
    clonedExpect = expect.clone();
  });

  it('is chainable (returns the expect function, not the magicpen instance)', () => {
    clonedExpect.addStyle('foo', () => {})('bar', 'to equal', 'bar');
  });
});
