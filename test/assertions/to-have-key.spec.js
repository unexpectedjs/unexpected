/*global expect*/
describe('to have key assertion', () => {
  it('asserts the presence of a key', () => {
    expect({ a: 'b' }, 'to have key', 'a');
    expect({ a: 'b' }, 'not to have key', 'b');
    expect({ a: 'b', c: 'd' }, 'not to have key', 'b');
    expect({ a: 'b', c: 'd' }, 'to not only have key', 'a');
  });

  it('throws when the assertion fails', () => {
    expect(
      function() {
        expect({ a: 'b', b: 'c' }, 'to have key', 'e');
      },
      'to throw exception',
      "expected { a: 'b', b: 'c' } to have key 'e'"
    );

    expect(
      function() {
        expect({ a: 'b', b: 'c' }, 'to only have key', 'b');
      },
      'to throw exception',
      "expected { a: 'b', b: 'c' } to only have key 'b'\n" +
        '\n' +
        '{\n' +
        "  a: 'b', // should be removed\n" +
        "  b: 'c'\n" +
        '}'
    );

    expect(
      function() {
        expect({ a: 'b', b: 'c' }, 'not to have key', 'b');
      },
      'to throw exception',
      "expected { a: 'b', b: 'c' } not to have key 'b'"
    );
  });
});
