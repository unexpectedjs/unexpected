/*global expect*/
describe('installTheme', () => {
  var clonedExpect;
  beforeEach(function() {
    clonedExpect = expect.clone();
  });

  it('is chainable (returns the expect function, not the magicpen instance)', () => {
    clonedExpect.installTheme('html', { comment: 'gray' })(
      'bar',
      'to equal',
      'bar'
    );
  });
});
