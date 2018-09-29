/*global expect*/
describe('to be falsy assertion', () => {
  it('assert that the value is falsy', () => {
    expect(true, 'not to be falsy');
    expect(0, 'to be falsy');
    expect(null, 'to be falsy');
    expect(undefined, 'to be falsy');
  });

  it('throws when the assertion fails', () => {
    expect(
      function() {
        expect(1, 'to be falsy');
      },
      'to throw exception',
      'expected 1 to be falsy'
    );
  });

  it('throws with message when the assertion fails', () => {
    expect(
      function() {
        expect(2 + 2 === 4, 'to be falsy', '2 + 2 === 4');
      },
      'to throw exception',
      "expected true to be falsy '2 + 2 === 4'"
    );
  });
});
