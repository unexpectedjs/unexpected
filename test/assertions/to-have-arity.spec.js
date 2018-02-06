/*global expect*/
describe('to have arity assertion', function() {
  it('tests that the subject function has the given arity', function() {
    expect(function() {}, 'to have arity', 0);
    expect(function(a) {}, 'to have arity', 1);
    expect(function(a, b) {}, 'to have arity', 2);
    // eslint-disable-next-line no-new-func
    expect(new Function('a', 'return 1'), 'to have arity', 1);
  });
});
