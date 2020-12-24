/* global expect */
describe('addType', () => {
  let clonedExpect;
  beforeEach(() => {
    clonedExpect = expect.clone();
  });

  it('throws an expection if the type has an empty or undefined name', () => {
    expect(function () {
      clonedExpect.addType({});
    }).toThrow(
      'A type must be given a non-empty name and must match ^[a-z_](?:|[a-z0-9_.-]*[_a-z0-9])$'
    );
  });

  it('throws an expection if the base type does not exist', () => {
    expect(function () {
      clonedExpect.addType({
        name: 'foo',
        base: 'barquux',
        identify() {
          return false;
        },
      });
    }).toThrow('Unknown base type: barquux');
  });

  it('throws an expection if the type has a name of "assertion"', () => {
    expect(function () {
      clonedExpect.addType({ name: 'assertion', identify: false });
    }).toThrow('The type with the name assertion already exists');
  });

  it('throw an expection if the type does not specify a correct identify field', () => {
    expect(function () {
      clonedExpect.addType({ name: 'wat' });
    }).toThrow(
      'Type wat must specify an identify function or be declared abstract by setting identify to false'
    );

    expect(function () {
      clonedExpect.addType({ name: 'wat', identify: true });
    }).toThrow(
      'Type wat must specify an identify function or be declared abstract by setting identify to false'
    );

    expect(function () {
      clonedExpect.addType({ name: 'wat', identify: 'wat' });
    }).toThrow(
      'Type wat must specify an identify function or be declared abstract by setting identify to false'
    );
  });

  it('throws an expection if a type of that name already exists', () => {
    expect(function () {
      clonedExpect.addType({ name: 'Promise', identify: false });
    }).toThrow('The type with the name Promise already exists');
  });

  it('throws an expection if the type starts with .', () => {
    expect(function () {
      clonedExpect.addType({ name: '.foo' });
    }).toThrow(
      'A type must be given a non-empty name and must match ^[a-z_](?:|[a-z0-9_.-]*[_a-z0-9])$'
    );
  });

  it('throws an expection if the type ends with .', () => {
    expect(function () {
      clonedExpect.addType({ name: 'foo.' });
    }).toThrow(
      'A type must be given a non-empty name and must match ^[a-z_](?:|[a-z0-9_.-]*[_a-z0-9])$'
    );
  });

  it('throws an expection if the type contains non-alphanumeric chars', () => {
    expect(function () {
      clonedExpect.addType({ name: 'ø' });
    }).toThrow(
      'A type must be given a non-empty name and must match ^[a-z_](?:|[a-z0-9_.-]*[_a-z0-9])$'
    );
  });

  describe('with a custom box type', () => {
    function box(value) {
      return {
        isBox: true,
        value,
      };
    }

    describe('added with a base type of any', () => {
      beforeEach(() => {
        clonedExpect.addType({
          name: 'box',
          identify(obj) {
            return obj && typeof obj === 'object' && obj.isBox;
          },
          equal(a, b, equal) {
            return a === b || equal(a.value, b.value);
          },
          inspect(obj, depth, output, inspect) {
            return output.text('box(').append(inspect(obj.value)).text(')');
          },
          diff(actual, expected, output, diff) {
            output = output
              .text('box(')
              .append(diff({ value: actual.value }, { value: expected.value }))
              .text(')');
            output.inline = true;
            return output;
          },
        });
      });

      it('should use the equal defined by the type', () => {
        clonedExpect(box(123)).toEqual(box(123));
        clonedExpect(box(123)).notToEqual(box(321));
      });

      it('shows a diff in case of a mismatch', () => {
        expect(function () {
          clonedExpect(box(box(123))).toEqual(box(box(456)));
        }).toThrow(
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

    describe('added with a base type of wrapperObject', () => {
      beforeEach(() => {
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
          },
        });
      });

      it('should use the equal defined by the type', () => {
        clonedExpect(box(123)).toEqual(box(123));
        clonedExpect(box(123)).notToEqual(box(321));
      });

      it('shows a diff in case of a mismatch', () => {
        expect(function () {
          clonedExpect(box(box(123))).toEqual(box(box(456)));
        }).toThrow(
          'expected box(box(123)) to equal box(box(456))\n' +
            '\n' +
            'box(box(\n' +
            '  123 // should equal 456\n' +
            '))'
        );
      });

      it('should include the diff when one is available', () => {
        expect(function () {
          clonedExpect(box('abc')).toEqual(box('abe'));
        }).toThrow(
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
  });

  describe('#inspect', () => {
    it('renders the name of the type if passed too few parameters, for compatibility with util.inspect', () => {
      expect(clonedExpect.getType('number').inspect()).toEqual('type: number');
    });
  });

  describe('base type', () => {
    describe('#inspect', () => {
      it('bails out if passed the wrong parameters', () => {
        expect(function () {
          clonedExpect.getType('number').baseType.inspect();
        }).toThrow(
          'You need to pass the output to baseType.inspect() as the third parameter'
        );
      });

      it('inspects a value', () => {
        expect(
          clonedExpect
            .getType('number')
            .baseType.inspect(null, 3, clonedExpect.createOutput())
            .toString()
        ).toEqual('null');
      });

      it('provides an inspect function as the 4th parameter', () => {
        clonedExpect.addType({
          name: 'foo',
          identify() {
            return false;
          },
          inspect(value, depth, output, inspect) {
            return output.append(inspect('foo'));
          },
        });

        clonedExpect.addType({
          name: 'bar',
          base: 'foo',
          identify() {
            return false;
          },
          inspect(value, depth, output, inspect) {
            return inspect(value);
          },
        });
        expect(
          clonedExpect
            .getType('bar')
            .baseType.inspect(
              null,
              3,
              clonedExpect.createOutput(),
              function (value) {
                return expect.createOutput().appendInspected(value);
              }
            )
            .toString('text')
        ).toEqual("'foo'");
      });
    });

    describe('#diff', () => {
      it('bails out if passed the wrong parameters', () => {
        expect(function () {
          clonedExpect.getType('number').baseType.diff();
        }).toThrow(
          'You need to pass the output to baseType.diff() as the third parameter'
        );
      });
    });
  });
});
