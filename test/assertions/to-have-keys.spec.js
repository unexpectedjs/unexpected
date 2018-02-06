/*global expect*/
describe('to have keys assertion', function() {
  it('asserts the presence of a list of keys', function() {
    expect({ a: 'b' }, 'not to have keys', []);
    expect({ a: 'b', c: 'd' }, 'to only have keys', 'a', 'c');
    expect({ a: 'b', c: 'd' }, 'to only have keys', ['a', 'c']);
    expect({ a: 'b', c: 'd', e: 'f' }, 'to not only have keys', ['a', 'c']);
  });

  it('throws when the assertion fails', function() {
    expect(
      function() {
        expect({ a: 'b', c: 'd' }, 'to not only have keys', ['a', 'c']);
      },
      'to throw exception',
      "expected { a: 'b', c: 'd' } to not only have keys [ 'a', 'c' ]"
    );

    expect(
      function() {
        expect({ a: 'b', c: 'd' }, 'to only have keys', 'a', 'd');
      },
      'to throw exception',
      "expected { a: 'b', c: 'd' } to only have keys 'a', 'd'"
    );

    expect(
      function() {
        expect({ a: 'b', c: 'd' }, 'to not only have keys', 'a', 'c');
      },
      'to throw exception',
      "expected { a: 'b', c: 'd' } to not only have keys 'a', 'c'"
    );
  });

  it('should fail with a diff when the only flag is used', function() {
    expect(
      function() {
        expect({ foo: 123, bar: 'quux' }, 'to only have keys', ['foo']);
      },
      'to throw',
      "expected { foo: 123, bar: 'quux' } to only have keys [ 'foo' ]\n" +
        '\n' +
        '{\n' +
        '  foo: 123,\n' +
        "  bar: 'quux' // should be removed\n" +
        '}'
    );
  });

  it('should work with non-enumerable keys returned by the getKeys function of the subject type', function() {
    expect(new Error('foo'), 'to only have key', 'message');
  });
});
