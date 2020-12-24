/* global expect */
describe('to be infinite assertion', () => {
  it('asserts a infinite number', () => {
    expect(123).notToBeInfinite();
    expect(0).notToBeInfinite();
    expect(Infinity).toBeInfinite();
    expect(-Infinity).toBeInfinite();
  });

  it('refuses to work on NaN', () => {
    expect(function () {
      expect(NaN).notToBeInfinite();
    }).toThrow(
      'expected NaN not to be infinite\n' +
        '  The assertion does not have a matching signature for:\n' +
        '    <NaN> not to be infinite\n' +
        '  did you mean:\n' +
        '    <number> [not] to be infinite'
    );
  });

  it('throws when the assertion fails', () => {
    expect(function () {
      expect(123).toBeInfinite();
    }).toThrowException('expected 123 to be infinite');
  });
});
