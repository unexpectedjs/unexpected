/* global expect */
describe('to have arity assertion', () => {
  it('tests that the subject function has the given arity', () => {
    expect(function () {}).toHaveArity(0);
    expect(function (a) {}).toHaveArity(1);
    expect(function (a, b) {}).toHaveArity(2);
    // eslint-disable-next-line no-new-func
    expect(new Function('a', 'return 1')).toHaveArity(1);
  });
});
