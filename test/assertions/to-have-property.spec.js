/*global expect*/
describe('to have property assertion', function () {
    it('asserts presence of an own property (and value optionally)', function () {
        expect([1, 2], 'to have property', 'length');
        expect([1, 2], 'to have property', 'length', 2);
        expect({a: 'b'}, 'to have property', 'a');
        expect({a: 'b'}, 'to have property', 'a', 'b');
        expect({a: 'b'}, 'to have property', 'toString');
        expect({a: 'b'}, 'not to have property', 'b');
        expect({'"a"': 'b'}, 'to have own property', '"a"');
        expect(Object.create({a: 'b'}), 'not to have own property', 'a');
        expect(function () {}, 'to have property', 'toString');
    });

    it('throws when the assertion fails', function () {
        expect(function () {
            expect({a: 'b'}, 'to have property', 'b');
        }, 'to throw exception', "expected { a: 'b' } to have property 'b'");

        expect(function () {
            expect(null, 'to have property', 'b');
        }, 'to throw exception',
               "expected null to have property 'b'\n" +
               "  No matching assertion, did you mean:\n" +
               "  <object|function> [not] to have property <string>\n" +
               "  <object|function> to have [own] property <string> <any>");

        expect(function () {
            expect({a: 'b'}, 'to have property', 'a', 'c');
        }, 'to throw exception',
               "expected { a: 'b' } to have property 'a' with a value of 'c'\n" +
               "\n" +
               "-b\n" +
               "+c");

        expect(function () {
            expect({a: 'b'}, 'to have own property', 'a', 'c');
        }, 'to throw exception',
               "expected { a: 'b' } to have own property 'a' with a value of 'c'\n" +
               "\n" +
               "-b\n" +
               "+c");

        expect(function () {
            // property expectations ignores value if property
            expect(null, 'not to have property', 'a', 'b');
        }, 'to throw exception',
               "expected null not to have property 'a', 'b'\n" +
               "  No matching assertion, did you mean:\n" +
               "  <object|function> [not] to have property <string>");

        expect(function () {
            // property expectations on value expects the property to be present
            expect(null, 'not to have own property', 'a', 'b');
        }, 'to throw exception',
               "expected null not to have own property 'a', 'b'\n" +
               "  No matching assertion, did you mean:\n" +
               "  <object|function> [not] to have own property <string>");
    });

    it('does not support the not-flag in combination with a value argument', function () {
        expect(function () {
            expect({ a: 'a' }, 'not to have property', 'a', 'a');
        }, "to throw",
               "expected { a: 'a' } not to have property 'a', 'a'\n" +
               "  No matching assertion, did you mean:\n" +
               "  <object|function> [not] to have property <string>");

        expect(function () {
            expect({ a: 'a' }, 'not to have own property', 'a', 'a');
        }, "to throw",
               "expected { a: 'a' } not to have own property 'a', 'a'\n" +
               "  No matching assertion, did you mean:\n" +
               "  <object|function> [not] to have own property <string>");
    });
});
