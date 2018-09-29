/*global expect*/
describe('greater than or equal assertion', () => {
  it('asserts >=', () => {
    expect(3, 'to be greater than or equal to', 2);
    expect(2, 'to be greater than or equal to', 2);
    expect('a', 'to be greater than or equal to', 'a');
    expect('b', 'to be greater than or equal to', 'a');
  });

  it('throws when the assertion fails', () => {
    expect(
      function() {
        expect(-1, 'to be greater than or equal to', 0);
      },
      'to throw exception',
      'expected -1 to be greater than or equal to 0'
    );
  });
});
