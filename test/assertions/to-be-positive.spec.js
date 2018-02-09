/*global expect*/
describe('positive assertion', function() {
  it('assert that a number is positive', function() {
    expect(3, 'to be positive');
  });

  it('throws when the assertion fails', function() {
    expect(
      function() {
        expect(0, 'to be positive');
      },
      'to throw exception',
      'expected 0 to be positive'
    );
  });
});
