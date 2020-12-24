/* global expect */
describe('to have key assertion', () => {
  it('asserts the presence of a key', () => {
    expect({ a: 'b' }).toHaveKey('a');
    expect({ a: 'b' }).notToHaveKey('b');
    expect({ a: 'b', c: 'd' }).notToHaveKey('b');
    expect({ a: 'b', c: 'd' }).toNotOnlyHaveKey('a');
  });

  it('throws when the assertion fails', () => {
    expect(function () {
      expect({ a: 'b', b: 'c' }).toHaveKey('e');
    }).toThrowException("expected { a: 'b', b: 'c' } to have key 'e'");

    expect(function () {
      expect({ a: 'b', b: 'c' }).toOnlyHaveKey('b');
    }).toThrowException(
      "expected { a: 'b', b: 'c' } to only have key 'b'\n" +
        '\n' +
        '{\n' +
        "  a: 'b', // should be removed\n" +
        "  b: 'c'\n" +
        '}'
    );

    expect(function () {
      expect({ a: 'b', b: 'c' }).notToHaveKey('b');
    }).toThrowException("expected { a: 'b', b: 'c' } not to have key 'b'");
  });
});
