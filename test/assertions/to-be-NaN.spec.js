/*global expect*/
describe('to be NaN assertion', () => {
  it('assert that the value is NaN or not', () => {
    expect(NaN, 'to be NaN');
    expect(2, 'not to be NaN');
  });

  it('fails when the assertion fails', () => {
    expect(
      () => {
        expect(0, 'to be NaN');
      },
      'to throw',
      'expected 0 to be NaN'
    );

    expect(
      () => {
        expect(NaN, 'not to be NaN');
      },
      'to throw',
      'expected NaN not to be NaN'
    );
  });
});
