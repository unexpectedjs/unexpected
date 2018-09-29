/*global expect*/
describe('to have arity assertion', () => {
  it('tests that the subject function has the given arity', () => {
    expect(() => {}, 'to have arity', 0);
    expect(a => {}, 'to have arity', 1);
    expect((a, b) => {}, 'to have arity', 2);
    // eslint-disable-next-line no-new-func
    expect(new Function('a', 'return 1'), 'to have arity', 1);
  });
});
