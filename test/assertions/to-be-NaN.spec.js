/*global expect*/
describe('to be NaN assertion', function() {
  it('assert that the value is NaN or not', function() {
    expect(NaN, 'to be NaN');
    expect(2, 'not to be NaN');
  });

  it('fails when the assertion fails', function() {
    expect(
      function() {
        expect(0, 'to be NaN');
      },
      'to throw',
      'expected 0 to be NaN'
    );

    expect(
      function() {
        expect(NaN, 'not to be NaN');
      },
      'to throw',
      'expected NaN not to be NaN'
    );
  });
});
