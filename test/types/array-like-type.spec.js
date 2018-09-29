/*global expect*/
describe('array-like type', function() {
  describe('equal()', function() {
    var simpleArrayLikeType = {
      name: 'simpleArrayLike',
      base: 'array-like',
      identify: Array.isArray,
      numericalPropertiesOnly: false
    };
    var clonedExpect = expect.clone().addType(simpleArrayLikeType);

    it('should treat properties with a value of undefined as equivalent to missing properties', function() {
      var a = [];
      a.ignoreMe = undefined;
      var b = [];

      clonedExpect(a, 'to equal', b);
      clonedExpect(b, 'to equal', a);
      clonedExpect(a, 'to satisfy', b);
      clonedExpect(b, 'to satisfy', a);
    });

    it('should error when a LHS key is undefined on the RHS', function() {
      var a = ['a'];
      a.foobar = true;
      var b = ['a'];

      expect(
        function() {
          clonedExpect(a, 'to equal', b);
        },
        'to throw',
        "expected [ 'a', foobar: true ] to equal [ 'a' ]\n" +
          '\n' +
          '[\n' +
          "  'a',\n" +
          '  foobar: true // should be removed\n' +
          ']'
      );
    });

    it('should error when a LHS key is explicitly undefined on the RHS', function() {
      var a = ['a'];
      a.foobar = true;
      var b = ['a'];
      b.foobar = undefined;

      expect(
        function() {
          clonedExpect(a, 'to equal', b);
        },
        'to throw',
        "expected [ 'a', foobar: true ] to equal [ 'a', foobar: undefined ]\n" +
          '\n' +
          '[\n' +
          "  'a',\n" +
          '  foobar: true // should be removed\n' +
          ']'
      );
    });

    it('should error when a LHS key is undefined on the RHS in "to satisfy"', function() {
      var a = ['a'];
      a.foobar = true;
      var b = ['a'];
      b.foobar = undefined;

      expect(
        function() {
          clonedExpect(a, 'to satisfy', b);
        },
        'to throw',
        "expected [ 'a', foobar: true ] to satisfy [ 'a', foobar: undefined ]\n" +
          '\n' +
          '[\n' +
          "  'a',\n" +
          '  foobar: true // should be removed\n' +
          ']'
      );
    });

    if (typeof Symbol === 'function') {
      it('should error when a LHS key is a Symbol but undefined on the RHS', function() {
        var a = ['a'];
        var s = Symbol('foo');
        a[s] = true;
        var b = ['a'];

        expect(
          function() {
            clonedExpect(a, 'to equal', b);
          },
          'to throw',
          "expected [ 'a', [Symbol('foo')]: true ] to equal [ 'a' ]\n" +
            '\n' +
            '[\n' +
            "  'a',\n" +
            "  [Symbol('foo')]: true // should be removed\n" +
            ']'
        );
      });

      (typeof weknowhow === 'undefined' ? it : it.skip)(
        'should correctly fetch keys in the absence of symbol support',
        function() {
          // stash away then clobber object symbol support
          var getOwnPropertySymbols = Object.getOwnPropertySymbols;
          delete Object.getOwnPropertySymbols;
          // grab a fresh copy of Unexpected with object symbol support disabled
          if (typeof jest !== 'undefined') {
            /*global jest*/
            jest.resetModules();
          } else {
            delete require.cache[require.resolve('../../lib/')];
          }
          var localExpect = require('../../lib/')
            .clone()
            .addType(simpleArrayLikeType);
          // restore object symbol support for the rest of the suite
          Object.getOwnPropertySymbols = getOwnPropertySymbols;

          var a = ['a'];
          a.foobar = true;
          var s = Symbol('foo');
          a[s] = true; // should be ignored
          var b = ['a'];
          b.foobar = undefined;

          localExpect(
            function() {
              localExpect(a, 'to equal', b);
            },
            'to throw',
            "expected [ 'a', foobar: true ] to equal [ 'a', foobar: undefined ]\n" +
              '\n' +
              '[\n' +
              "  'a',\n" +
              '  foobar: true // should be removed\n' +
              ']'
          );
        }
      );
    }
  });

  describe('with a subtype that disables indentation', function() {
    var clonedExpect = expect.clone();

    clonedExpect.addType({
      base: 'array-like',
      name: 'bogusarray',
      identify: Array.isArray,
      indent: false
    });

    it('should not render the indentation when an instance is inspected in a multi-line context', function() {
      expect(
        clonedExpect
          .inspect([
            'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
          ])
          .toString(),
        'to equal',
        '[\n' +
          "'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',\n" +
          "'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'\n" +
          ']'
      );
    });

    it('should not render the indentation when an instance is diffed', function() {
      expect(
        clonedExpect.diff(['a', 'b'], ['aa', 'bb']).toString(),
        'to equal',
        '[\n' +
          "'a', // should equal 'aa'\n" +
          '     //\n' +
          '     // -a\n' +
          '     // +aa\n' +
          "'b' // should equal 'bb'\n" +
          '    //\n' +
          '    // -b\n' +
          '    // +bb\n' +
          ']'
      );
    });

    it('should not render the indentation when an instance participates in a "to satisfy" diff', function() {
      expect(
        function() {
          clonedExpect(['aaa', 'bbb'], 'to satisfy', { 0: 'foo' });
        },
        'to throw',
        "expected [ 'aaa', 'bbb' ] to satisfy { 0: 'foo' }\n" +
          '\n' +
          '[\n' +
          "'aaa', // should equal 'foo'\n" +
          '       //\n' +
          '       // -aaa\n' +
          '       // +foo\n' +
          "'bbb'\n" +
          ']'
      );
    });
  });

  describe('with a subtype that renders an empty prefix and an empty suffix', function() {
    var clonedExpect = expect.clone();

    clonedExpect.addType({
      base: 'array-like',
      name: 'bogusarray',
      identify: Array.isArray,
      prefix(output) {
        return output;
      },
      suffix(output) {
        return output;
      }
    });

    it('should not render the prefix, suffix, and the newlines when an instance is inspected in a multi-line context', function() {
      expect(
        clonedExpect
          .inspect([
            'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
          ])
          .toString(),
        'to equal',
        "  'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',\n" +
          "  'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'"
      );
    });

    it('should not render the prefix, suffix, and the newlines when an instance is diffed', function() {
      expect(
        clonedExpect.diff(['a', 'b'], ['aa', 'bb']).toString(),
        'to equal',
        "  'a', // should equal 'aa'\n" +
          '       //\n' +
          '       // -a\n' +
          '       // +aa\n' +
          "  'b' // should equal 'bb'\n" +
          '      //\n' +
          '      // -b\n' +
          '      // +bb'
      );
    });

    it('should not render the prefix, suffix, and the newlines when an instance participates in a "to satisfy" diff', function() {
      expect(
        function() {
          clonedExpect(['aaa', 'bbb'], 'to satisfy', { 0: 'foo' });
        },
        'to throw',
        "expected 'aaa', 'bbb' to satisfy { 0: 'foo' }\n" +
          '\n' +
          "  'aaa', // should equal 'foo'\n" +
          '         //\n' +
          '         // -aaa\n' +
          '         // +foo\n' +
          "  'bbb'"
      );
    });
  });

  describe('with a subtype that forces forceMultipleLines mode', function() {
    var clonedExpect = expect.clone();

    clonedExpect.addType({
      base: 'array-like',
      name: 'bogusarray',
      identify: Array.isArray,
      forceMultipleLines: true
    });

    it('should inspect in forceMultipleLines mode despite being able to render on one line', function() {
      expect(
        clonedExpect.inspect(['a', 'b']).toString(),
        'to equal',
        '[\n' + "  'a',\n" + "  'b'\n" + ']'
      );
    });
  });

  function toArguments() {
    return arguments;
  }

  describe('when both types have numericalPropertiesOnly set', function() {
    it('should only compare numerical properties for equality', function() {
      var a = toArguments(1, 2);
      var b = toArguments(1, 2);
      b.foo = 123;
      expect(a, 'to equal', b);
    });

    it('should fail when a numerical property has different values', function() {
      var a = toArguments(1, 3);
      var b = toArguments(1, 2);
      expect(a, 'not to equal', b);
    });
  });

  describe('with a custom subtype that comes with its own getKeys', function() {
    it('should process the elements in both inspection and diff in "to equal"', function() {
      var a = ['a'];
      var b = ['a'];
      b.foobar = true;

      var clonedExpect = expect.clone().addType({
        name: 'foo',
        base: 'array-like',
        identify: Array.isArray,
        numericalPropertiesOnly: false,
        getKeys(obj) {
          // use array-like getKeys() method in non-numerical mode
          var keys = this.baseType.getKeys.call(this, obj);
          if (obj === a) {
            keys.push('foobar');
          }
          return keys;
        }
      });

      expect(
        function() {
          clonedExpect(a, 'to equal', b);
        },
        'to throw',
        "expected [ 'a', foobar: undefined ] to equal [ 'a', foobar: true ]\n" +
          '\n' +
          '[\n' +
          "  'a'\n" +
          '  // missing foobar: true\n' +
          ']'
      );
    });

    it('should process the elements in both inspection and diff in "to satisfy"', function() {
      var a = ['a'];
      var b = ['a'];
      b.foobar = true;

      var clonedExpect = expect.clone().addType({
        name: 'foo',
        base: 'array-like',
        identify: Array.isArray,
        numericalPropertiesOnly: false,
        getKeys(obj) {
          // use array-like getKeys in non-numerical mode
          var keys = this.baseType.getKeys.call(this, obj);
          if (obj === a) {
            keys.push('foobar');
          }
          return keys;
        }
      });

      expect(
        function() {
          clonedExpect(a, 'to satisfy', b);
        },
        'to throw',
        "expected [ 'a', foobar: undefined ] to satisfy [ 'a', foobar: true ]\n" +
          '\n' +
          '[\n' +
          "  'a'\n" +
          '  // missing foobar: true\n' +
          ']'
      );
    });

    it('should honour the precise list of keys returned by getKeys in "to satisfy"', function() {
      var clonedExpect = expect.clone();

      clonedExpect.addType({
        name: 'foo',
        base: 'array-like',
        identify: function(obj) {
          return obj && obj._isFoo;
        },
        numericalPropertiesOnly: false,
        getKeys: function(obj) {
          var keys = this.baseType.getKeys(obj);
          var fooIndex = keys.indexOf('_isFoo');
          if (fooIndex > -1) {
            keys = keys.splice(fooIndex, 1);
          }
          keys.push('bar');
          return keys;
        }
      });

      var foo1 = ['hey', 'there'];
      foo1._isFoo = true;
      Object.defineProperty(foo1, 'bar', {
        value: 123,
        enumerable: false
      });
      var foo2 = ['hey', 'there'];
      foo2._isFoo = true;
      Object.defineProperty(foo2, 'bar', {
        value: 456,
        enumerable: false
      });

      expect(
        function() {
          clonedExpect(foo1, 'to satisfy', foo2);
        },
        'to throw',
        "expected [ 'hey', 'there', bar: 123 ] to satisfy [ 'hey', 'there', bar: 456 ]\n" +
          '\n' +
          '[\n' +
          "  'hey',\n" +
          "  'there',\n" +
          '  bar: 123 // should equal 456\n' +
          ']'
      );
    });
  });

  describe('with a custom subtype that comes with its own hasKey', function() {
    it('should honour the presence of a key within inspection', function() {
      var clonedExpect = expect.clone().addType({
        name: 'allExceptFoo',
        base: 'array-like',
        identify: Array.isArray,
        numericalPropertiesOnly: false,
        hasKey: function(obj, key) {
          if (String(key).indexOf('foo') === 0) {
            return false;
          }
          return obj[key];
        }
      });

      var arr = ['a'];
      arr.fooAndBar = true;

      clonedExpect(arr, 'to inspect as', "[ 'a', fooAndBar: undefined ]");
    });
  });

  describe('with a subtype that overrides property()', function() {
    it('should render correctly in both inspection and diff in "to equal"', function() {
      var clonedExpect = expect.clone();

      clonedExpect.addStyle('xuuqProperty', function(key, inspectedValue) {
        this.text('<')
          .appendInspected(key)
          .text('> --> ')
          .append(inspectedValue);
      });

      clonedExpect.addType({
        name: 'xuuq',
        base: 'array-like',
        numericalPropertiesOnly: false,
        identify: function(obj) {
          return obj && typeof 'object' && obj.quux === 'xuuq';
        },
        property: function(output, key, inspectedValue, isSubjectArrayLike) {
          if (isSubjectArrayLike && !isNaN(Number(key))) {
            return this.baseType.property(
              output,
              key,
              inspectedValue,
              isSubjectArrayLike
            );
          }
          return output.xuuqProperty(key, inspectedValue);
        }
      });

      const lhs = [1, 2, 3];
      lhs.quux = 'xuuq';
      lhs.foobar = 'faz';
      lhs.missing = true;
      const rhs = [1, 2, 4];
      rhs.quux = 'xuuq';
      rhs.foobar = 'baz';

      expect(
        function() {
          clonedExpect(lhs, 'to equal', rhs);
        },
        'to throw',
        'expected\n' +
          '[\n' +
          '  1,\n' +
          '  2,\n' +
          '  3,\n' +
          "  <'quux'> --> 'xuuq',\n" +
          "  <'foobar'> --> 'faz',\n" +
          "  <'missing'> --> true\n" +
          ']\n' +
          "to equal [ 1, 2, 4, <'quux'> --> 'xuuq', <'foobar'> --> 'baz' ]\n" +
          '\n' +
          '[\n' +
          '  1,\n' +
          '  2,\n' +
          '  3, // should equal 4\n' +
          "  <'quux'> --> 'xuuq',\n" +
          "  <'foobar'> --> 'faz', // should equal 'baz'\n" +
          '                        //\n' +
          '                        // -faz\n' +
          '                        // +baz\n' +
          "  <'missing'> --> true // should be removed\n" +
          ']'
      );
    });
  });

  describe('with a custom subtype that comes with its own valueForKeys', function() {
    it('should process the elements in both inspection and diff in "to equal"', function() {
      var clonedExpect = expect.clone().addType({
        name: 'firstElemUpper',
        base: 'array-like',
        identify: Array.isArray,
        valueForKey: function(arr, key) {
          var value = arr[key];
          if (key === 0) {
            return value.toUpperCase();
          }
          return value;
        }
      });
      expect(
        function() {
          clonedExpect(['foobar', 'barbar'], 'to equal', ['foobar', 'barbaz']);
        },
        'to throw',
        "expected [ 'FOOBAR', 'barbar' ] to equal [ 'FOOBAR', 'barbaz' ]\n" +
          '\n' +
          '[\n' +
          "  'FOOBAR',\n" +
          "  'barbar' // should equal 'barbaz'\n" +
          '           //\n' +
          '           // -barbar\n' +
          '           // +barbaz\n' +
          ']'
      );
    });
  });

  it('should inspect as [...] at depth 2+', function() {
    expect(
      [[[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]]],
      'to inspect as',
      '[ [ [...] ] ]'
    );
  });

  it('should render a moved item with an arrow', function() {
    expect(
      function() {
        expect(['a', 'b', 'c'], 'to equal', ['c', 'a', 'b']);
      },
      'to error with',
      "expected [ 'a', 'b', 'c' ] to equal [ 'c', 'a', 'b' ]\n" +
        '\n' +
        '[\n' +
        '┌─▷\n' +
        "│   'a',\n" +
        "│   'b',\n" +
        "└── 'c' // should be moved\n" +
        ']'
    );
  });

  it('should stop rendering more arrows when there would be more than 3 lanes', function() {
    expect(
      function() {
        expect(['a', 'b', 'c', 'd', 'e', 'f'], 'to equal', [
          'f',
          'c',
          'd',
          'e',
          'a',
          'b'
        ]);
      },
      'to error with',
      "expected [ 'a', 'b', 'c', 'd', 'e', 'f' ] to equal [ 'f', 'c', 'd', 'e', 'a', 'b' ]\n" +
        '\n' +
        '[\n' +
        "        // missing 'f'\n" +
        '┌─────▷\n' +
        '│ ┌───▷\n' +
        '│ │ ┌─▷\n' +
        "│ │ │   'a',\n" +
        "│ │ │   'b',\n" +
        "└─│─│── 'c', // should be moved\n" +
        "  └─│── 'd', // should be moved\n" +
        "    └── 'e', // should be moved\n" +
        "        'f' // should be removed\n" +
        ']'
    );
  });

  it('should render multiple moved items with arrows', function() {
    expect(
      function() {
        expect(['a', 'b', 'c', 'd'], 'to equal', ['d', 'b', 'a', 'c']);
      },
      'to error with',
      "expected [ 'a', 'b', 'c', 'd' ] to equal [ 'd', 'b', 'a', 'c' ]\n" +
        '\n' +
        '[\n' +
        '┌───▷\n' +
        '│ ┌─▷\n' +
        "│ │   'a',\n" +
        "│ └── 'b', // should be moved\n" +
        "│     'c',\n" +
        "└──── 'd' // should be moved\n" +
        ']'
    );
  });

  it('should render 3 moved neighbor items', function() {
    expect(
      function() {
        expect(['a', 'b', 'c', 'd', 'e'], 'to equal', [
          'c',
          'd',
          'e',
          'a',
          'b'
        ]);
      },
      'to error with',
      "expected [ 'a', 'b', 'c', 'd', 'e' ] to equal [ 'c', 'd', 'e', 'a', 'b' ]\n" +
        '\n' +
        '[\n' +
        '┌─────▷\n' +
        '│ ┌───▷\n' +
        '│ │ ┌─▷\n' +
        "│ │ │   'a',\n" +
        "│ │ │   'b',\n" +
        "└─│─│── 'c', // should be moved\n" +
        "  └─│── 'd', // should be moved\n" +
        "    └── 'e' // should be moved\n" +
        ']'
    );
  });
});
