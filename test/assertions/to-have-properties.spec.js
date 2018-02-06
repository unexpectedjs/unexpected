/*global expect*/
describe('to have properties assertion', function() {
  it('asserts presence of a list of properties', function() {
    expect({ a: 'foo', b: 'bar' }, 'to have properties', ['a', 'b']);
  });

  it('asserts presence of a list of own properties', function() {
    expect({ a: 'foo', b: 'bar' }, 'to have own properties', ['a', 'b']);
    expect(
      function() {
        var obj = Object.create({ a: 'foo', b: 'bar' });
        expect(obj, 'to have properties', ['a', 'b']); // should not fail
        expect(obj, 'to have own properties', ['a', 'b']); // should fail
      },
      'to throw',
      "expected {} to have own properties [ 'a', 'b' ]"
    );
  });

  it('asserts the absence of a property when the RHS object has an undefined value', function() {
    expect({}, 'to have properties', { a: undefined });
  });

  it('asserts absence of a list of properties', function() {
    expect({ a: 'foo', b: 'bar' }, 'not to have properties', ['c', 'd']);
    expect(
      function() {
        expect({ a: 'foo', b: 'bar' }, 'not to have properties', ['a', 'd']);
      },
      'to throw',
      "expected { a: 'foo', b: 'bar' } not to have properties [ 'a', 'd' ]"
    );
  });

  it('asserts absence of a list of own properties', function() {
    var obj = Object.create({ a: 'foo', b: 'bar' });
    expect(obj, 'to have properties', ['a', 'b']);
    expect(obj, 'not to have own properties', ['a', 'b']);
    expect(
      function() {
        expect({ a: 'foo', b: 'bar' }, 'not to have own properties', [
          'a',
          'b'
        ]); // should fail
      },
      'to throw',
      "expected { a: 'foo', b: 'bar' } not to have own properties [ 'a', 'b' ]"
    );
  });

  it('asserts presence and values of an object of properties', function() {
    expect(
      { a: 'foo', b: 'bar', c: 'baz', d: { qux: 'qux', quux: 'quux' } },
      'to have properties',
      {
        a: 'foo',
        b: 'bar',
        d: { qux: 'qux', quux: 'quux' }
      }
    );
    expect(
      function() {
        expect({ a: 'foo', b: 'bar' }, 'to have properties', { c: 'baz' });
      },
      'to throw',
      "expected { a: 'foo', b: 'bar' } to have properties { c: 'baz' }\n" +
        '\n' +
        '{\n' +
        "  a: 'foo',\n" +
        "  b: 'bar'\n" +
        "  // missing c: 'baz'\n" +
        '}'
    );
    expect(
      function() {
        expect({ a: 'foo', b: 'bar' }, 'to have properties', { b: 'baz' });
      },
      'to throw',
      "expected { a: 'foo', b: 'bar' } to have properties { b: 'baz' }\n" +
        '\n' +
        '{\n' +
        "  a: 'foo',\n" +
        "  b: 'bar' // should equal 'baz'\n" +
        '           //\n' +
        '           // -bar\n' +
        '           // +baz\n' +
        '}'
    );
  });

  it('asserts presence and values of an object of own properties', function() {
    expect({ a: 'foo', b: 'bar' }, 'to have own properties', {
      a: 'foo',
      b: 'bar'
    });
    expect(
      function() {
        var obj = Object.create({ a: 'foo', b: 'bar' });
        expect(obj, 'to have properties', { a: 'foo', b: 'bar' }); // should not fail
        expect(obj, 'to have own properties', { a: 'foo', b: 'bar' }); // should fail
      },
      'to throw',
      "expected {} to have own properties { a: 'foo', b: 'bar' }\n" +
        '\n' +
        '{\n' +
        "  // missing a: 'foo'\n" +
        "  // missing b: 'bar'\n" +
        '}'
    );

    expect(
      function() {
        expect({ a: 'f00', b: 'bar' }, 'to have own properties', {
          a: 'foo',
          b: 'bar'
        }); // should fail
      },
      'to throw',
      "expected { a: 'f00', b: 'bar' } to have own properties { a: 'foo', b: 'bar' }\n" +
        '\n' +
        '{\n' +
        "  a: 'f00', // should equal 'foo'\n" +
        '            //\n' +
        '            // -f00\n' +
        '            // +foo\n' +
        "  b: 'bar'\n" +
        '}'
    );
  });

  it('asserts absence and values of an object of own properties', function() {
    var obj = Object.create({ a: 'foo', b: 'bar' });
    expect(obj, 'to have properties', { a: 'foo', b: 'bar' });
    expect(obj, 'not to have own properties', ['a', 'b']);
    expect(
      function() {
        expect({ a: 'foo', b: 'bar' }, 'not to have own properties', [
          'a',
          'b'
        ]); // should fail
      },
      'to throw',
      "expected { a: 'foo', b: 'bar' } not to have own properties [ 'a', 'b' ]"
    );
  });

  it('includes prototype properties in the actual property (#48)', function() {
    function Foo() {}

    Foo.prototype.doSomething = function() {};

    expect(
      function() {
        expect(new Foo(), 'to have properties', { a: 123 });
      },
      'to throw',
      'expected Foo({}) to have properties { a: 123 }\n' +
        '\n' +
        'Foo({\n' +
        '  doSomething: function () {}\n' +
        '  // missing a: 123\n' +
        '})'
    );
  });

  it('throws when the assertion fails', function() {
    expect(
      function() {
        expect({ a: 'foo', b: 'bar' }, 'to have properties', ['c', 'd']);
      },
      'to throw',
      "expected { a: 'foo', b: 'bar' } to have properties [ 'c', 'd' ]"
    );

    expect(
      function() {
        expect({ a: 'foo' }, 'to have properties', { a: undefined });
      },
      'to throw',
      "expected { a: 'foo' } to have properties { a: undefined }\n" +
        '\n' +
        '{\n' +
        "  a: 'foo' // should be undefined\n" +
        '}'
    );
  });

  it('throws when given invalid input', function() {
    expect(
      function() {
        expect({ a: 'foo', b: 'bar' }, 'to have properties', 'a', 'b');
      },
      'to throw',
      "expected { a: 'foo', b: 'bar' } to have properties 'a', 'b'\n" +
        '  The assertion does not have a matching signature for:\n' +
        '    <object> to have properties <string> <string>\n' +
        '  did you mean:\n' +
        '    <object|function> [not] to have [own] properties <array>\n' +
        '    <object|function> to have [own] properties <object>'
    );

    expect(
      function() {
        expect({ a: 'foo', b: 'bar' }, 'not to have properties', {
          a: 'foo',
          b: 'bar'
        });
      },
      'to throw',
      "expected { a: 'foo', b: 'bar' } not to have properties { a: 'foo', b: 'bar' }\n" +
        '  The assertion does not have a matching signature for:\n' +
        '    <object> not to have properties <object>\n' +
        '  did you mean:\n' +
        '    <object|function> [not] to have [own] properties <array>'
    );
  });

  it('works with function objects as well', function() {
    var subject = function() {};
    subject.foo = 'foo';
    subject.bar = 'bar';
    subject.baz = 'baz';

    expect(subject, 'to have properties', {
      foo: 'foo',
      bar: 'bar',
      baz: 'baz'
    });
  });

  describe('with expected numerical property names listed as numbers', function() {
    it('should succeed', function() {
      expect({ 1: 'foo', 2: 'bar' }, 'to have properties', [1, 2]);
    });

    it('should fail with a diff', function() {
      expect(
        function() {
          expect({ 1: 123, 2: 456 }, 'to have properties', [1, 3]);
        },
        'to error',
        'expected { 1: 123, 2: 456 } to have properties [ 1, 3 ]'
      );
    });
  });

  describe('with expected property names listed as neither strings nor numbers', function() {
    it('should fail when a boolean is passed, even if there is a corresponding string property', function() {
      expect(
        function() {
          expect({ true: 123 }, 'to have properties', [true]);
        },
        'to error',
        'expected { true: 123 } to have properties [ true ]\n' +
          '  All expected properties must be passed as strings or numbers, but these are not:\n' +
          '    true'
      );
    });

    it('should fail when an object is passed, even if there is a corresponding string property', function() {
      expect(
        function() {
          expect({ foo: 123 }, 'to have properties', [
            {
              toString: function toString() {
                return 'foo';
              }
            }
          ]);
        },
        'to error',
        'expected { foo: 123 }\n' +
          "to have properties [ { toString: function toString() { return 'foo'; } } ]\n" +
          '  All expected properties must be passed as strings or numbers, but these are not:\n' +
          "    { toString: function toString() { return 'foo'; } }"
      );
    });

    it('should should mention all the non-string, non-number property names in a list after the error message', function() {
      expect(
        function() {
          expect({ foo: 123 }, 'to have properties', [true, false]);
        },
        'to error',
        'expected { foo: 123 } to have properties [ true, false ]\n' +
          '  All expected properties must be passed as strings or numbers, but these are not:\n' +
          '    true\n' +
          '    false'
      );
    });
  });
});
