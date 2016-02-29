/*global expect*/
describe('addType', function () {
    function box(value) {
        return {
            isBox: true,
            value: value
        };
    }
    var clonedExpect;

    beforeEach(function () {
        clonedExpect = expect.clone();
        clonedExpect.addType({
            name: 'box',
            identify: function (obj) {
                return obj && typeof obj === 'object' && obj.isBox;
            },
            equal: function (a, b, equal) {
                return a === b || equal(a.value, b.value);
            },
            inspect: function (obj, depth, output, inspect) {
                return output
                    .text('box(')
                    .append(inspect(obj.value))
                    .text(')');
            },
            diff: function (actual, expected, output, diff) {
                var comparison = diff({ value: actual.value }, { value: expected.value });
                comparison.diff = output.text('box(').append(comparison.diff).text(')');
                return comparison;
            }
        });
    });

    it('throws an expection if the type has an empty or undefined name', function () {
        expect(function () {
            clonedExpect.addType({});
        }, 'to throw', 'A type must be given a non-empty name and must match ^[a-z_](?:|[a-z0-9_.-]*[_a-z0-9])$');
    });

    it('throws an expection if the type has a name of "assertion"', function () {
        expect(function () {
            clonedExpect.addType({ name: 'assertion', identify: false });
        }, 'to throw', 'The type with the name assertion already exists');
    });

    it('throw an expection if the type does not specify a correct identify field', function () {
        expect(function () {
            clonedExpect.addType({ name: 'wat' });
        }, 'to throw', 'Type wat must specify an identify function or be declared abstract by setting identify to false');

        expect(function () {
            clonedExpect.addType({ name: 'wat', identify: true });
        }, 'to throw', 'Type wat must specify an identify function or be declared abstract by setting identify to false');

        expect(function () {
            clonedExpect.addType({ name: 'wat', identify: 'wat' });
        }, 'to throw', 'Type wat must specify an identify function or be declared abstract by setting identify to false');
    });

    it('throws an expection if a type of that name already exists', function () {
        expect(function () {
            clonedExpect.addType({ name: 'Promise', identify: false });
        }, 'to throw', 'The type with the name Promise already exists');
    });

    it('throws an expection if the type starts with .', function () {
        expect(function () {
            clonedExpect.addType({name: '.foo'});
        }, 'to throw', 'A type must be given a non-empty name and must match ^[a-z_](?:|[a-z0-9_.-]*[_a-z0-9])$');
    });

    it('throws an expection if the type ends with .', function () {
        expect(function () {
            clonedExpect.addType({name: 'foo.'});
        }, 'to throw', 'A type must be given a non-empty name and must match ^[a-z_](?:|[a-z0-9_.-]*[_a-z0-9])$');
    });

    it('throws an expection if the type contains non-alphanumeric chars', function () {
        expect(function () {
            clonedExpect.addType({name: 'ø'});
        }, 'to throw', 'A type must be given a non-empty name and must match ^[a-z_](?:|[a-z0-9_.-]*[_a-z0-9])$');
    });

    it('should use the equal defined by the type', function () {
        clonedExpect(box(123), 'to equal', box(123));
        clonedExpect(box(123), 'not to equal', box(321));
    });

    it('shows a diff in case of a mismatch', function () {
        expect(function () {
            clonedExpect(box(box(123)), 'to equal', box(box(456)));
        }, 'to throw', "expected box(box(123)) to equal box(box(456))\n" +
               "\n" +
               "box({\n" +
               "  value: box({\n" +
               "    value: 123 // should equal 456\n" +
               "  })\n" +
               "})");
    });

    describe('with base type wrapperObject', function () {
        beforeEach(function () {
            clonedExpect = expect.clone();
            clonedExpect.addType({
                name: 'box',
                base: 'wrapperObject',
                identify: function (obj) {
                    return obj && typeof obj === 'object' && obj.isBox;
                },
                unwrap: function (box) {
                    return box.value;
                },
                prefix: function (output) {
                    return output.text('box(');
                },
                suffix: function (output) {
                    return output.text(')');
                }
            });
        });

        it('should use the equal defined by the type', function () {
            clonedExpect(box(123), 'to equal', box(123));
            clonedExpect(box(123), 'not to equal', box(321));
        });

        it('shows a diff in case of a mismatch', function () {
            expect(function () {
                clonedExpect(box(box(123)), 'to equal', box(box(456)));
            }, 'to throw', "expected box(box(123)) to equal box(box(456))\n" +
                   "\n" +
                   "box(box(\n" +
                   "  123 // should equal 456\n" +
                   "))");
        });

        it('should include the diff when one is available', function () {
            expect(function () {
                clonedExpect(box('abc'), 'to equal', box('abe'));
            }, 'to throw',
                   "expected box('abc') to equal box('abe')\n" +
                   "\n" +
                   "box(\n" +
                   "  'abc' // should equal 'abe'\n" +
                   "        //\n" +
                   "        // -abc\n" +
                   "        // +abe\n" +
                   ")"
                  );
        });
    });
});
