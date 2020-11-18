/* global expect */
describe('Date type', () => {
  it('inspects as an ISO string', () => {
    expect(new Date(0), 'to inspect as', "new Date('1970-01-01T00:00:00Z')");
  });

  it('inspects with three milliseconds digits when the milliseconds field has two digits', () => {
    expect(
      new Date(10),
      'to inspect as',
      "new Date('1970-01-01T00:00:00.010Z')"
    );
  });

  it('inspects with three milliseconds digits when the milliseconds field has three digits', () => {
    expect(
      new Date(100),
      'to inspect as',
      "new Date('1970-01-01T00:00:00.100Z')"
    );
  });
});
