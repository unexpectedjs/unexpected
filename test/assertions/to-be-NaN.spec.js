/* global expect */
describe('to be NaN assertion', () => {
  it('asserts that the value is NaN or not', () => {
    expect(NaN, 'to be NaN');
    expect(2, 'not to be NaN');
  });

  it('fails when the assertion fails', () => {
    expect(
      function () {
        expect(0, 'to be NaN');
      },
      'to throw',
      'expected 0 to be NaN'
    );

    expect(
      function () {
        expect(NaN, 'not to be NaN');
      },
      'to throw',
      'expected NaN not to be NaN'
    );
  });
});
