/*global expect*/
describe('to have keys satisfying assertion', function () {
    it('requires a third argument', function () {
        expect(function () {
            expect([1, 2, 3], 'to have keys satisfying');
        }, 'to throw',
            "expected [ 1, 2, 3 ] to have keys satisfying\n" +
            "  The assertion does not have a matching signature for:\n" +
            "    <array> to have keys satisfying\n" +
            "  did you mean:\n" +
            "    <object> to have keys satisfying <any>\n" +
            "    <object> to have keys satisfying <assertion>"
        );
    });

    it('does not accept a fourth argument', function () {
        expect(function () {
            expect([1], 'to have keys satisfying', 0, 1);
        }, 'to throw',
            "expected [ 1 ] to have keys satisfying 0, 1\n" +
            "  The assertion does not have a matching signature for:\n" +
            "    <array> to have keys satisfying <number> <number>\n" +
            "  did you mean:\n" +
            "    <object> to have keys satisfying <any>\n" +
            "    <object> to have keys satisfying <assertion>"
        );
    });

    it('only accepts objects as the target', function () {
        expect(function () {
            expect(42, 'to have keys satisfying', function (key) {});
        }, 'to throw',
            "expected 42 to have keys satisfying function (key) {}\n" +
            "  The assertion does not have a matching signature for:\n" +
            "    <number> to have keys satisfying <function>\n" +
            "  did you mean:\n" +
            "    <object> to have keys satisfying <any>\n" +
            "    <object> to have keys satisfying <assertion>"
        );
    });

    it('asserts that the given callback does not throw for any keys in the map', function () {
        expect({ foo: 0, bar: 1, baz: 2, qux: 3 }, 'to have keys satisfying', function (key) {
            expect(key, 'not to be empty');
        });

        expect({ foo: 0, bar: 1, baz: 2, qux: 3 }, 'to have keys satisfying', function (key) {
            expect(key, 'to match', /^[a-z]{3}$/);
        });

        expect({ foo: 0, bar: 1, baz: 2, qux: 3 }, 'to have keys satisfying', 'not to be empty');

        expect({ foo: 0, bar: 1, baz: 2, qux: 3 }, 'to have keys satisfying', 'to match', /^[a-z]{3}$/);
    });

    it('receives the key and the value when the third argument is a function', function () {
        expect({ foo: 123 }, 'to have keys satisfying', function (key) {
            expect(key, 'to equal', 'foo');
        });
    });

    it('fails if the given object is empty', function () {
        expect(function () {
            expect({}, 'to have keys satisfying', function (key) {
                expect(key, 'to match', /^[a-z]{3}$/);
            });
        }, 'to throw',
               "expected {} to have keys satisfying\n" +
               "function (key) {\n" +
               "  expect(key, 'to match', /^[a-z]{3}$/);\n" +
               "}\n" +
               "  expected {} not to equal {}");
    });

    it('fails for an empty array', function () {
        expect(function () {
            expect([], 'to have keys satisfying', 123);
        }, 'to throw',
            "expected [] to have keys satisfying 123\n" +
            "  expected [] not to equal []");
    });

    it('should work with non-enumerable keys returned by the getKeys function of the subject type', function () {
        expect(function () {
            expect(new Error('foo'), 'to have keys satisfying', /bar/);
        }, 'to throw',
               "expected Error('foo') to have keys satisfying /bar/\n" +
               "\n" +
               "[\n" +
               "  'message' // should match /bar/\n" +
               "]");
    });

    it('supports legacy aliases', function () {
        expect({ foo: '0' }, 'to be a map whose keys satisfy', function (key) {
            expect(key, 'to match', /^[a-z]{3}$/);
        });

        expect({ foo: '0' }, 'to be an object whose keys satisfy', function (key) {
            expect(key, 'to match', /^[a-z]{3}$/);
        });

        expect({ foo: '0' }, 'to be a hash whose keys satisfy', function (key) {
            expect(key, 'to match', /^[a-z]{3}$/);
        });
    });

    it('fails when the assertion fails', function () {
        expect(function () {
            expect({ foo: 0, bar: 1, Baz: 2, qux: 3 }, 'to have keys satisfying', function (key) {
                expect(key, 'to match', /^[a-z]{3}$/);
            });
        }, 'to throw', /'Baz', \/\/ should match/);
    });

    it('provides a detailed report of where failures occur', function () {
        expect(function () {
            expect({ foo: 0, bar: 1, baz: 2, qux: 3, quux: 4 }, 'to have keys satisfying', function (key) {
                expect(key, 'to have length', 3);
            });
        }, 'to throw',
               "expected { foo: 0, bar: 1, baz: 2, qux: 3, quux: 4 } to have keys satisfying\n" +
               "function (key) {\n" +
               "  expect(key, 'to have length', 3);\n" +
               "}\n" +
               "\n" +
               "[\n" +
               "  'foo',\n" +
               "  'bar',\n" +
               "  'baz',\n" +
               "  'qux',\n" +
               "  'quux' // should have length 3\n" +
               "         //   expected 4 to be 3\n" +
               "]");
    });

    describe('delegating to an async assertion', function () {
        var clonedExpect = expect.clone()
            .addAssertion('to be a sequence of as after a short delay', function (expect, subject, delay) {
                expect.errorMode = 'nested';

                return expect.promise(function (run) {
                    setTimeout(run(function () {
                        expect(subject, 'to match', /^a+$/);
                    }), 1);
                });
            });

        it('should succeed', function () {
            return clonedExpect({a: 1, aa: 2}, 'to have keys satisfying', 'to be a sequence of as after a short delay');
        });

        it('should fail with a diff', function () {
            return expect(
                clonedExpect({a: 1, foo: 2, bar: 3}, 'to have keys satisfying', 'to be a sequence of as after a short delay'),
                'to be rejected with',
                "expected { a: 1, foo: 2, bar: 3 }\n" +
                    "to have keys satisfying to be a sequence of as after a short delay\n" +
                    "\n" +
                    "[\n" +
                    "  'a',\n" +
                    "  'foo', // should be a sequence of as after a short delay\n" +
                    "         //   should match /^a+$/\n" +
                    "  'bar' // should be a sequence of as after a short delay\n" +
                    "        //   should match /^a+$/\n" +
                    "]");
        });
    });
});
