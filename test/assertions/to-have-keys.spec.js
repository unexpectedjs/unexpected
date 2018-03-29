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

  describe('with a subtype that overrides valueForKey()', function() {
    var clonedExpect = expect.clone();

    clonedExpect.addType({
      name: 'upperFooObject',
      base: 'object',
      identify: function(obj) {
        return obj && typeof 'object' && obj.foo === '';
      },
      valueForKey: function(obj, key) {
        if (key === 'foo') {
          return 'FOO';
        }
        return obj[key];
      }
    });

    it('should process the value in "to only have keys"', function() {
      expect(
        function() {
          clonedExpect({ oof: undefined, foo: '' }, 'to only have keys', [
            'oof'
          ]);
        },
        'to throw',
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
