/* global expect */
describe('Date type', () => {
  it('inspects without milliseconds when the milliseconds field is zero', () => {
    expect(
      new Date(0),
      'to inspect as',
      "new Date('Thu, 01 Jan 1970 00:00:00 GMT')"
    );
  });

  it('inspects with three milliseconds digits when the milliseconds field has one digit', () => {
    expect(
      new Date(1),
      'to inspect as',
      "new Date('Thu, 01 Jan 1970 00:00:00.001 GMT')"
    );
  });

  it('inspects with three milliseconds digits when the milliseconds field has two digits', () => {
    expect(
      new Date(10),
      'to inspect as',
      "new Date('Thu, 01 Jan 1970 00:00:00.010 GMT')"
    );
  });

  it('inspects with three milliseconds digits when the milliseconds field has three digits', () => {
    expect(
      new Date(100),
      'to inspect as',
      "new Date('Thu, 01 Jan 1970 00:00:00.100 GMT')"
    );
  });
});
