/*global expect*/
describe('addType', function() {
  var clonedExpect;
  beforeEach(function() {
    clonedExpect = expect.clone();
  });

  it('throws an expection if the type has an empty or undefined name', function() {
    expect(
      function() {
        clonedExpect.addType({});
      },
      'to throw',
      'A type must be given a non-empty name and must match ^[a-z_](?:|[a-z0-9_.-]*[_a-z0-9])$'
    );
  });

  it('throws an expection if the base type does not exist', function() {
    expect(
      function() {
        clonedExpect.addType({
          name: 'foo',
          base: 'barquux',
          identify() {
            return false;
          }
        });
      },
      'to throw',
      'Unknown base type: barquux'
    );
  });

  it('throws an expection if the type has a name of "assertion"', function() {
    expect(
      function() {
        clonedExpect.addType({ name: 'assertion', identify: false });
      },
      'to throw',
      'The type with the name assertion already exists'
    );
  });

  it('throw an expection if the type does not specify a correct identify field', function() {
    expect(
      function() {
        clonedExpect.addType({ name: 'wat' });
      },
      'to throw',
      'Type wat must specify an identify function or be declared abstract by setting identify to false'
    );

    expect(
      function() {
        clonedExpect.addType({ name: 'wat', identify: true });
      },
      'to throw',
      'Type wat must specify an identify function or be declared abstract by setting identify to false'
    );

    expect(
      function() {
        clonedExpect.addType({ name: 'wat', identify: 'wat' });
      },
      'to throw',
      'Type wat must specify an identify function or be declared abstract by setting identify to false'
    );
  });

  it('throws an expection if a type of that name already exists', function() {
    expect(
      function() {
        clonedExpect.addType({ name: 'Promise', identify: false });
      },
      'to throw',
      'The type with the name Promise already exists'
    );
  });

  it('throws an expection if the type starts with .', function() {
    expect(
      function() {
        clonedExpect.addType({ name: '.foo' });
      },
      'to throw',
      'A type must be given a non-empty name and must match ^[a-z_](?:|[a-z0-9_.-]*[_a-z0-9])$'
    );
  });

  it('throws an expection if the type ends with .', function() {
    expect(
      function() {
        clonedExpect.addType({ name: 'foo.' });
      },
      'to throw',
      'A type must be given a non-empty name and must match ^[a-z_](?:|[a-z0-9_.-]*[_a-z0-9])$'
    );
  });

  it('throws an expection if the type contains non-alphanumeric chars', function() {
    expect(
      function() {
        clonedExpect.addType({ name: 'ø' });
      },
      'to throw',
      'A type must be given a non-empty name and must match ^[a-z_](?:|[a-z0-9_.-]*[_a-z0-9])$'
    );
  });

  describe('with a custom box type', function() {
    function box(value) {
      return {
        isBox: true,
        value
      };
    }

    describe('added with a base type of any', function() {
      beforeEach(function() {
        clonedExpect.addType({
          name: 'box',
          identify(obj) {
            return obj && typeof obj === 'object' && obj.isBox;
          },
          equal(a, b, equal) {
            return a === b || equal(a.value, b.value);
          },
          inspect(obj, depth, output, inspect) {
            return output
              .text('box(')
              .append(inspect(obj.value))
              .text(')');
          },
          diff(actual, expected, output, diff) {
            output = output
              .text('box(')
              .append(diff({ value: actual.value }, { value: expected.value }))
              .text(')');
            output.inline = true;
            return output;
          }
        });
      });

      it('should use the equal defined by the type', function() {
        clonedExpect(box(123), 'to equal', box(123));
        clonedExpect(box(123), 'not to equal', box(321));
      });

      it('shows a diff in case of a mismatch', function() {
        expect(
          function() {
            clonedExpect(box(box(123)), 'to equal', box(box(456)));
          },
          'to throw',
          'expected box(box(123)) to equal box(box(456))\n' +
            '\n' +
            'box({\n' +
            '  value: box({\n' +
            '    value: 123 // should equal 456\n' +
            '  })\n' +
            '})'
        );
      });
    });

    describe('added with a base type of wrapperObject', function() {
      beforeEach(function() {
        clonedExpect.addType({
          name: 'box',
          base: 'wrapperObject',
          identify(obj) {
            return obj && typeof obj === 'object' && obj.isBox;
          },
          unwrap(box) {
            return box.value;
          },
          prefix(output) {
            return output.text('box(');
          },
          suffix(output) {
            return output.text(')');
          }
        });
      });

      it('should use the equal defined by the type', function() {
        clonedExpect(box(123), 'to equal', box(123));
        clonedExpect(box(123), 'not to equal', box(321));
      });

      it('shows a diff in case of a mismatch', function() {
        expect(
          function() {
            clonedExpect(box(box(123)), 'to equal', box(box(456)));
          },
          'to throw',
          'expected box(box(123)) to equal box(box(456))\n' +
            '\n' +
            'box(box(\n' +
            '  123 // should equal 456\n' +
            '))'
        );
      });

      it('should include the diff when one is available', function() {
        expect(
          function() {
            clonedExpect(box('abc'), 'to equal', box('abe'));
          },
          'to throw',
          "expected box('abc') to equal box('abe')\n" +
            '\n' +
            'box(\n' +
            "  'abc' // should equal 'abe'\n" +
            '        //\n' +
            '        // -abc\n' +
            '        // +abe\n' +
            ')'
        );
      });
    });

    it('allows adding a type whose diff method returns an old-style { inline: <boolean>, diff: <magicpen> } object', function() {
      clonedExpect.addType({
        name: 'box',
        identify(obj) {
          return obj && typeof obj === 'object' && obj.isBox;
        },
        equal(a, b, equal) {
          return a === b || equal(a.value, b.value);
        },
        inspect(obj, depth, output, inspect) {
          return output
            .text('box(')
            .append(inspect(obj.value))
            .text(')');
        },
        diff(actual, expected, output, diff) {
          return {
            inline: true,
            diff: output
              .text('box(')
              .append(diff({ value: actual.value }, { value: expected.value }))
              .text(')')
          };
        }
      });

      expect(
        function() {
          clonedExpect(box('abc'), 'to equal', box('abe'));
        },
        'to throw',
        "expected box('abc') to equal box('abe')\n" +
          '\n' +
          'box({\n' +
          "  value: 'abc' // should equal 'abe'\n" +
          '               //\n' +
          '               // -abc\n' +
          '               // +abe\n' +
          '})'
      );
    });
  });

  describe('#inspect', function() {
    it('renders the name of the type if passed too few parameters, for compatibility with util.inspect', function() {
      expect(
        clonedExpect.getType('number').inspect(),
        'to equal',
        'type: number'
      );
    });
  });

  describe('base type', function() {
    describe('#inspect', function() {
      it('bails out if passed the wrong parameters', function() {
        expect(
          function() {
            clonedExpect.getType('number').baseType.inspect();
          },
          'to throw',
          'You need to pass the output to baseType.inspect() as the third parameter'
        );
      });

      it('inspects a value', function() {
        expect(
          clonedExpect
            .getType('number')
            .baseType.inspect(null, 3, clonedExpect.createOutput())
            .toString(),
          'to equal',
          'null'
        );
      });

      it('provides an inspect function as the 4th parameter', function() {
        clonedExpect.addType({
          name: 'foo',
          identify() {
            return false;
          },
          inspect(value, depth, output, inspect) {
            return output.append(inspect('foo'));
          }
        });

        clonedExpect.addType({
          name: 'bar',
          base: 'foo',
          identify() {
            return false;
          },
          inspect(value, depth, output, inspect) {
            return inspect(value);
          }
        });
        expect(
          clonedExpect
            .getType('bar')
            .baseType.inspect(null, 3, clonedExpect.createOutput(), function(
              value
            ) {
              return expect.createOutput().appendInspected(value);
            })
            .toString('text'),
          'to equal',
          "'foo'"
        );
      });
    });

    describe('#diff', function() {
      it('bails out if passed the wrong parameters', function() {
        expect(
          function() {
            clonedExpect.getType('number').baseType.diff();
          },
          'to throw',
          'You need to pass the output to baseType.diff() as the third parameter'
        );
      });
    });
  });
});
