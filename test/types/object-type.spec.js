/*global expect*/
describe('object type', function() {
  describe('#diff', function() {
    it('should show identical multiline values correctly in diffs', function() {
      var clonedExpect = expect.clone().addType({
        name: 'numberNine',
        identify(obj) {
          return obj === 9;
        },
        inspect(value, depth, output) {
          output.block(function() {
            this.text('NUMBER')
              .nl()
              .text(' NINE ');
          });
        }
      });
      expect(
        function() {
          clonedExpect({ a: 123, b: 9 }, 'to equal', { a: 456, b: 9 });
        },
        'to throw',
        'expected\n' +
          '{\n' +
          '  a: 123,\n' +
          '  b: NUMBER\n' +
          '      NINE \n' +
          '}\n' +
          'to equal\n' +
          '{\n' +
          '  a: 456,\n' +
          '  b: NUMBER\n' +
          '      NINE \n' +
          '}\n' +
          '\n' +
          '{\n' +
          '  a: 123, // should equal 456\n' +
          '  b: NUMBER\n' +
          '      NINE \n' +
          '}'
      );
    });
  });

  describe('with a subtype that disables indentation', function() {
    var clonedExpect = expect.clone();

    clonedExpect.addType({
      base: 'object',
      name: 'bogusobject',
      identify(obj) {
        return obj && typeof obj === 'object' && !Array.isArray(obj);
      },
      indent: false
    });

    it('should not render the indentation when an instance is inspected in a multi-line context', function() {
      expect(
        clonedExpect
          .inspect({
            a:
              'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            b:
              'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
          })
          .toString(),
        'to equal',
        '{\n' +
          "a: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',\n" +
          "b: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'\n" +
          '}'
      );
    });

    it('should not render the indentation when an instance is diffed', function() {
      expect(
        clonedExpect.diff({ a: 'a', b: 'b' }, { a: 'aa', b: 'bb' }).toString(),
        'to equal',
        '{\n' +
          "a: 'a', // should equal 'aa'\n" +
          '        //\n' +
          '        // -a\n' +
          '        // +aa\n' +
          "b: 'b' // should equal 'bb'\n" +
          '       //\n' +
          '       // -b\n' +
          '       // +bb\n' +
          '}'
      );
    });

    it('should not render the indentation when an instance participates in a "to satisfy" diff', function() {
      expect(
        function() {
          clonedExpect({ a: 'aaa', b: 'bbb' }, 'to satisfy', { a: 'foo' });
        },
        'to throw',
        "expected { a: 'aaa', b: 'bbb' } to satisfy { a: 'foo' }\n" +
          '\n' +
          '{\n' +
          "a: 'aaa', // should equal 'foo'\n" +
          '          //\n' +
          '          // -aaa\n' +
          '          // +foo\n' +
          "b: 'bbb'\n" +
          '}'
      );
    });
  });

  describe('with a subtype that renders an empty prefix and an empty suffix', function() {
    var clonedExpect = expect.clone();

    clonedExpect.addType({
      base: 'object',
      name: 'bogusobject',
      identify(obj) {
        return obj && typeof obj === 'object' && !Array.isArray(obj);
      },
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
          .inspect({
            a:
              'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            b:
              'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
          })
          .toString(),
        'to equal',
        "  a: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',\n" +
          "  b: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'"
      );
    });

    it('should not render the prefix, suffix, and the newlines when an instance is diffed', function() {
      expect(
        clonedExpect.diff({ a: 'a', b: 'b' }, { a: 'aa', b: 'bb' }).toString(),
        'to equal',
        "  a: 'a', // should equal 'aa'\n" +
          '          //\n' +
          '          // -a\n' +
          '          // +aa\n' +
          "  b: 'b' // should equal 'bb'\n" +
          '         //\n' +
          '         // -b\n' +
          '         // +bb'
      );
    });

    it('should not render the prefix, suffix, and the newlines when an instance participates in a "to satisfy" diff', function() {
      expect(
        function() {
          clonedExpect({ a: 'aaa', b: 'bbb' }, 'to satisfy', { a: 'foo' });
        },
        'to throw',
        "expected a: 'aaa', b: 'bbb' to satisfy a: 'foo'\n" +
          '\n' +
          "  a: 'aaa', // should equal 'foo'\n" +
          '            //\n' +
          '            // -aaa\n' +
          '            // +foo\n' +
          "  b: 'bbb'"
      );
    });
  });

  describe('with a subtype that forces forceMultipleLines mode', function() {
    var clonedExpect = expect.clone();

    clonedExpect.addType({
      base: 'object',
      name: 'bogusobject',
      identify(obj) {
        return obj && typeof obj === 'object' && !Array.isArray(obj);
      },
      forceMultipleLines: true
    });

    it('should inspect in forceMultipleLines mode despite being able to render on one line', function() {
      expect(
        clonedExpect.inspect({ a: 'a', b: 'b' }).toString(),
        'to equal',
        '{\n' +
        "  a: 'a', b: 'b'\n" + // This is the 'compact' feature kicking in
          '}'
      );
    });
  });

  describe('with a subtype that overrides property()', function() {
    it('should render correctly in both inspection and diff', function() {
      var clonedExpect = expect.clone();
      var customObject = { quux: 'xuuq', foobar: 'faz' };

      clonedExpect.addStyle('xuuqProperty', function(key, inspectedValue) {
        this.text('<')
          .appendInspected(key)
          .text('> --> ')
          .append(inspectedValue);
      });

      clonedExpect.addType({
        name: 'xuuq',
        base: 'object',
        identify: function(obj) {
          return obj && typeof 'object' && obj.quux === 'xuuq';
        },
        property: function(output, key, inspectedValue) {
          return output.xuuqProperty(key, inspectedValue);
        }
      });

      expect(
        function() {
          clonedExpect(customObject, 'to equal', {
            quux: 'xuuq',
            foobar: 'baz'
          });
        },
        'to throw',
        "expected { <'quux'> --> 'xuuq', <'foobar'> --> 'faz' }\n" +
          "to equal { <'quux'> --> 'xuuq', <'foobar'> --> 'baz' }\n" +
          '\n' +
          '{\n' +
          "  <'quux'> --> 'xuuq',\n" +
          "  <'foobar'> --> 'faz' // should equal 'baz'\n" +
          '                       //\n' +
          '                       // -faz\n' +
          '                       // +baz\n' +
          '}'
      );
    });
  });

  describe('with a subtype that overrides valueForKey()', function() {
    var clonedExpect = expect.clone();

    clonedExpect.addType({
      name: 'nineObject',
      base: 'object',
      identify: function(obj) {
        return obj && typeof 'object' && obj.nine === 9;
      },
      valueForKey: function(obj, key) {
        if (typeof obj[key] === 'string') {
          return obj[key].toUpperCase();
        }
        return obj[key];
      }
    });

    it('should process propeties in both inspection and diff', function() {
      expect(
        function() {
          clonedExpect({ nine: 9, zero: 1, foo: 'bAr' }, 'to equal', {
            nine: 9,
            zero: 0,
            foo: 'BaR'
          });
        },
        'to throw',
        "expected { nine: 9, zero: 1, foo: 'BAR' } to equal { nine: 9, zero: 0, foo: 'BAR' }\n" +
          '\n' +
          '{\n' +
          '  nine: 9,\n' +
          '  zero: 1, // should equal 0\n' +
          "  foo: 'BAR'\n" +
          '}'
      );
    });
  });
});
