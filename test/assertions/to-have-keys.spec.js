/* global expect */
describe('to have keys assertion', () => {
  it('asserts the presence of a list of keys', () => {
    expect({ a: 'b' }).notToHaveKeys([]);
    expect({ a: 'b', c: 'd' }).toOnlyHaveKeys('a', 'c');
    expect({ a: 'b', c: 'd' }).toOnlyHaveKeys(['a', 'c']);
    expect({ a: 'b', c: 'd', e: 'f' }).toNotOnlyHaveKeys(['a', 'c']);
  });

  it('throws when the assertion fails', () => {
    expect(function () {
      expect({ a: 'b', c: 'd' }).toNotOnlyHaveKeys(['a', 'c']);
    }).toThrowException(
      "expected { a: 'b', c: 'd' } to not only have keys [ 'a', 'c' ]"
    );

    expect(function () {
      expect({ a: 'b', c: 'd' }).toOnlyHaveKeys('a', 'd');
    }).toThrowException(
      "expected { a: 'b', c: 'd' } to only have keys 'a', 'd'"
    );

    expect(function () {
      expect({ a: 'b', c: 'd' }).toNotOnlyHaveKeys('a', 'c');
    }).toThrowException(
      "expected { a: 'b', c: 'd' } to not only have keys 'a', 'c'"
    );
  });

  it('should fail with a diff when the only flag is used', () => {
    expect(function () {
      expect({ foo: 123, bar: 'quux' }).toOnlyHaveKeys(['foo']);
    }).toThrow(
      "expected { foo: 123, bar: 'quux' } to only have keys [ 'foo' ]\n" +
        '\n' +
        '{\n' +
        '  foo: 123,\n' +
        "  bar: 'quux' // should be removed\n" +
        '}'
    );
  });

  it('should work with non-enumerable keys returned by the getKeys function of the subject type', () => {
    expect(new Error('foo')).toOnlyHaveKey('message');
  });

  describe('with a subtype that overrides valueForKey()', () => {
    const clonedExpect = expect.clone();

    clonedExpect.addType({
      name: 'upperFooObject',
      base: 'object',
      identify: function (obj) {
        return obj && typeof 'object' && obj.foo === '';
      },
      valueForKey: function (obj, key) {
        if (key === 'foo') {
          return 'FOO';
        }
        return obj[key];
      },
    });

    it('should process the value in "to only have keys"', () => {
      expect(function () {
        clonedExpect({ oof: undefined, foo: '' }).toOnlyHaveKeys(['oof']);
      }).toThrow(
        "expected { oof: undefined, foo: 'FOO' } to only have keys [ 'oof' ]\n" +
          '\n' +
          '{\n' +
          '  oof: undefined,\n' +
          "  foo: 'FOO' // should be removed\n" +
          '}'
      );
    });
  });
});
