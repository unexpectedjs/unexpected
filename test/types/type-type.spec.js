/*global expect*/
describe('type type', function() {
  it('inspects correctly', function() {
    expect(expect.findTypeOf(123), 'to inspect as', 'type: number');
  });
});
