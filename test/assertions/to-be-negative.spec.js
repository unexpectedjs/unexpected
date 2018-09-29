/*global expect*/
describe('negative assertion', () => {
  it('assert that a number is negative', () => {
    expect(-1, 'to be negative');
  });

  it('throws when the assertion fails', () => {
    expect(
      function() {
        expect(0, 'to be negative');
      },
      'to throw exception',
      'expected 0 to be negative'
    );
  });
});
