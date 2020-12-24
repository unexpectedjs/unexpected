/* global expect */
describe('to be NaN assertion', () => {
  it('asserts that the value is NaN or not', () => {
    expect(NaN).toBeNaN();
    expect(2).notToBeNaN();
  });

  it('fails when the assertion fails', () => {
    expect(function () {
      expect(0).toBeNaN();
    }).toThrow('expected 0 to be NaN');

    expect(function () {
      expect(NaN).notToBeNaN();
    }).toThrow('expected NaN not to be NaN');
  });
});
