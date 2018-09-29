/*global expect*/
describe('positive assertion', () => {
  it('assert that a number is positive', () => {
    expect(3, 'to be positive');
  });

  it('throws when the assertion fails', () => {
    expect(
      () => {
        expect(0, 'to be positive');
      },
      'to throw exception',
      'expected 0 to be positive'
    );
  });
});
