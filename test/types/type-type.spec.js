/* global expect */
describe('type type', () => {
  it('inspects correctly', () => {
    expect(expect.findTypeOf(123), 'to inspect as', 'type: number');
  });
});
