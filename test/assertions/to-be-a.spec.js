/*global expect*/
describe('to be a/an assertion', function () {
    var circular = {};
    circular.self = circular;

    it('asserts typeof with support for array type and instanceof', function () {
        expect(5, 'to be a', 'number');
        expect(5, 'to be a number');
        expect('abc', 'to be a', 'string');
        expect('', 'to be a string');
        expect('', 'to be the empty string');
        expect('', 'to be an empty string');
        expect('abc', 'to be a non-empty string');
        expect([], 'to be an', 'array');
        expect([], 'to be an array');
        expect([], 'to be an empty array');
        expect({}, 'to be an', Object);
        expect([123], 'to be a non-empty array');
        expect([], 'to be an', 'object');
        expect([], 'to be an object');
        expect([], 'to be an', Array);
        expect(/ab/, 'to be a', RegExp);
        expect(/ab/, 'to be a regexp');
        expect(123, 'not to be a regex');
        expect(/ab/, 'to be a regex');
        expect(/ab/, 'to be a regular expression');
        expect(123, 'not to be a regular expression');
        expect(null, 'not to be an', 'object');
        expect(null, 'not to be an object');
        expect(true, 'to be a', 'boolean');
        expect(true, 'to be a boolean');
        expect(expect, 'to be a', 'function');
        expect(expect, 'to be a function');
        expect(circular, 'to be an object');
    });

    it('should support type objects', function () {
        expect('foo', 'to be a', expect.getType('string'));
    });

    describe('with a type name', function () {
        it('should succeed when the subject is recognized as having the type', function () {
            expect(new Error('foo'), 'to be an', 'Error');
        });

        it('should fail when the subject is not recognized as having the type', function () {
            expect(function () {
                expect(123, 'to be an', 'Error');
            }, 'to throw', 'expected 123 to be an Error');
        });

        // Maybe better: throw a non-Unexpected error
        it('should fail when the type is not defined', function () {
            expect(function () {
                expect(123, 'to be a', 'FoopQuuxDoop');
            }, 'to throw', 'expected 123 to be a FoopQuuxDoop');
        });
    });

    it('formats Error instances correctly when an assertion fails', function () {
        expect(function () {
            var error = new Error('error message');
            error.data = 'extra';
            expect(error, 'to be a number');
        }, 'to throw', "expected Error({ message: 'error message', data: 'extra' }) to be a number");
    });

    it('should fail with the correct error message if the type is given as an anonymous function', function () {
        expect(function () {
            expect('foo', 'to be a', function () {});
        }, 'to throw', "expected 'foo' to be a function () {}");
    });

    it('should throw when the type is specified as undefined', function () {
        expect(function () {
            expect('foo', 'to be an', undefined);
        }, 'to throw',
               "expected 'foo' to be an undefined\n" +
               "  No matching assertion, did you mean:\n" +
               "  <any> [not] to be (a|an) <function>\n" +
               "  <any> [not] to be (a|an) <string>\n" +
               "  <any> [not] to be (a|an) <type>");
    });

    it('should throw when the type is specified as null', function () {
        expect(function () {
            expect('foo', 'to be a', null);
        }, 'to throw',
               "expected 'foo' to be a null\n" +
               "  No matching assertion, did you mean:\n" +
               "  <any> [not] to be (a|an) <function>\n" +
               "  <any> [not] to be (a|an) <string>\n" +
               "  <any> [not] to be (a|an) <type>");
    });

    it('should not consider a string a to be an instance of an object without a name property', function () {
        expect(function () {
            expect('foo', 'to be a', {});
        }, 'to throw',
               "expected 'foo' to be a {}\n" +
               "  No matching assertion, did you mean:\n" +
               "  <any> [not] to be (a|an) <function>\n" +
               "  <any> [not] to be (a|an) <string>\n" +
               "  <any> [not] to be (a|an) <type>");
    });

    it('should throw when the type is specified as an object without an identify function', function () {
        expect(function () {
            expect('foo', 'to be a', { name: 'bar' });
        }, 'to throw',
               "expected 'foo' to be a { name: 'bar' }\n" +
               "  No matching assertion, did you mean:\n" +
               "  <any> [not] to be (a|an) <function>\n" +
               "  <any> [not] to be (a|an) <string>\n" +
               "  <any> [not] to be (a|an) <type>");
    });

    it('should throw when the type is specified as an object with an identify function, but without a name property', function () {
        expect(function () {
            expect('foo', 'to be a', { identify: function () { return true; } });
        }, 'to throw',
               "expected 'foo' to be a { identify: function () { return true; } }\n" +
               "  No matching assertion, did you mean:\n" +
               "  <any> [not] to be (a|an) <function>\n" +
               "  <any> [not] to be (a|an) <string>\n" +
               "  <any> [not] to be (a|an) <type>");
    });

    it('throws when the assertion fails', function () {
        expect(function () {
            expect(5, 'to be an', Array);
        }, 'to throw exception', 'expected 5 to be an Array');

        expect(function () {
            expect([], 'not to be an', 'array');
        }, 'to throw exception', "expected [] not to be an array");

        expect(function () {
            expect(circular, 'not to be an object');
        }, 'to throw exception', "expected { self: [Circular] } not to be an object");
    });

    it("throws an error a diff when comparing string and not negated", function () {
        expect(function () {
            expect('foo', 'to be', 'bar');
        }, 'to throw exception',
               "expected 'foo' to be 'bar'\n" +
               "\n" +
               "-foo\n" +
               "+bar");
    });

    it("throws an error without actual and expected when comparing string and negated", function () {
        expect(function () {
            expect('foo', 'not to be', 'foo');
        }, 'to throw exception', function (e) {
            expect(e, 'not to have property', 'actual');
            expect(e, 'not to have property', 'expected');
        });
    });

    it("throws an error without actual and expected when not comparing string and not negated", function () {
        expect(function () {
            expect('foo', 'to be', {});
        }, 'to throw exception', function (e) {
            expect(e, 'not to have property', 'actual');
            expect(e, 'not to have property', 'expected');
        });
    });
});
