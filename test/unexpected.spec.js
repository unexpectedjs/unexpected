/*global describe, it, expect*/

// use this instead of Object.create in order to make the tests run in
// es5 compatible browsers
function create(o) {
    function F() {}
    F.prototype = o;
    return new F();
}

describe('unexpected', function () {
    describe('ok/truthy/falsy assertion', function () {
        it('assert that the value is truthy or not', function () {
            expect(1, 'to be ok');
            expect(true, 'to be ok');
            expect(true, 'to not be falsy');
            expect({}, 'to be truthy');
            expect(0, 'to not be ok');
            expect(0, 'to be falsy');
            expect(null, 'to be falsy');
            expect(undefined, 'to be falsy');
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect(0, 'to be ok');
            }, 'to throw exception', 'expected 0 to be ok');
        });

        it('throws with message when the assertion fails', function () {
            expect(function () {
                expect(4 < 4, 'to be ok', '4 < 4');
            }, "to throw exception", "expected false to be ok '4 < 4'");
        });
    });

    describe('be assertion', function () {
        it('assert === equality', function () {
            var obj = {};
            expect(obj, 'to be', obj);
            expect(obj, 'to not be', {});
            expect(1, 'to be', 1);
            expect(NaN, 'to not be', NaN);
            expect(1, 'to not be', true);
            expect('1', 'to not be', 1);
            expect(null, 'to not be', undefined);
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect('foo', 'to be', 'bar');
            }, 'to throw exception', "expected 'foo' to be 'bar'");

            expect(function () {
                expect(true, 'to not be', true);
            }, 'to throw exception', "expected true to not be true");
        });
    });

    describe('a/an assertion', function () {
        it('asserts typeof with support for array type and instanceof', function () {
            expect(5, 'to be a', 'number');
            expect(5, 'to be a number');
            expect([], 'to be an', 'array');
            expect([], 'to be an array');
            expect([], 'to be an', 'object');
            expect([], 'to be an object');
            expect([], 'to be an', Array);
            expect(null, 'to not be an', 'object');
            expect(null, 'to not be an object');
            expect(true, 'to be a', 'boolean');
            expect(true, 'to be a boolean');
            expect("".substring, 'to be a', 'function');
            expect("".substring, 'to be a function');
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect(5, 'to be a', Array);
            }, 'to throw exception', /expected 5 to be a \[Function(: Array)?\]/);

            expect(function () {
                expect([], 'to not be an', 'array');
            }, 'to throw exception', "expected [] to not be an 'array'");
        });
    });

    describe('equal assertion', function () {
        it('asserts loose equality that works with objects', function () {
            expect({ a: 'b' }, 'to equal', { a: 'b' });
            expect(1, 'to equal', '1');
            expect(1, 'to equal', 1);
            expect(null, 'to not equal', '1');
            var now = new Date();
            expect(now, 'to equal', now);
            expect(now, 'to equal', new Date(now.getTime()));
            expect({ now: now }, 'to equal', { now: now });
            expect(null, 'to equal', null);
            expect(null, 'to not equal', undefined);
            expect(undefined, 'to equal', undefined);
            expect(true, 'to equal', true);
            expect(false, 'to equal', false);
            expect({ a: { b: 'c' } }, 'to equal', { a: { b: 'c' } });
            expect({ a: { b: 'c' } }, 'to not equal', { a: { b: 'd' } });
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect({ a: { b: 'c'} }, 'to equal', { a: { b: 'd'} });
            }, 'to throw exception', "expected { a: { b: 'c' } } to equal { a: { b: 'd' } }");

            expect(function () {
                expect({ a: 'b' }, 'to not equal', { a: 'b' });
            }, 'to throw exception', "expected { a: 'b' } to not equal { a: 'b' }");
        });
    });

    describe('exception assertion', function () {
        it('fails if no exception is thrown', function () {
            expect(function () {
                expect(function () {
                    // Don't throw
                }, 'to throw exception');
            }, 'to throw exception', 'expected [Function] to throw exception');
        });

        it('fails if the argument is not a function', function () {
            expect(function () {
                expect(1, 'to throw exception');
            }, 'to throw exception', "Assertion 'to throw exception' only supports functions");
        });

        it('given a function the function is called with the exception', function () {
            expect(function () {
                throw new SyntaxError();
            }, 'to throw exception', function (e) {
                expect(e, 'to be a', SyntaxError);
            });
        });

        it('matches the message against the given regular expression', function () {
            expect(function () {
                throw new Error('matches the exception message');
            }, 'to throw exception', /matches the exception message/);
            expect(function () {
                throw new Error('Other error');
            }, 'to not throw exception', /matches the exception message/);
        });

        it('exactly matches the message against the given string', function () {
            expect(function () {
                throw new Error('matches the exception message');
            }, 'to throw exception', 'matches the exception message');
            expect(function () {
                throw new Error('matches the exception message');
            }, 'to not throw exception', 'the exception message');
        });
    });

    describe('match assertion', function () {
        it('tests that the subject matches the given regular expression', function () {
            expect('test', 'to match', /.*st/);
            expect('test', 'to not match', /foo/);
            expect(null, 'to not match', /foo/);
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect('test', 'to match', /foo/);
            }, 'to throw exception', "expected 'test' to match /foo/");
        });
    });

    describe('contain assertion', function () {
        it('asserts indexOf for an array or string', function () {
            expect([1, 2], 'to contain', 1);
            expect([1, 2], 'to contain', 2, 1);
            expect('hello world', 'to contain', 'world');
            expect(null, 'to not contain', 'world');
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect('hello world', 'to contain', 'foo');
            }, 'to throw exception', "expected 'hello world' to contain 'foo'");

            expect(function () {
                expect('hello world', 'to contain', 'hello', 'foo');
            }, 'to throw exception', "expected 'hello world' to contain 'hello', 'foo'");

            expect(function () {
                expect([1, 2], 'to contain', 2, 3);
            }, 'to throw exception', "expected [ 1, 2 ] to contain 2, 3");

            expect(function () {
                expect(1, 'to contain', 1);
            }, 'to throw exception', "Assertion 'to contain' only supports strings and arrays");
        });
    });

    describe('length assertion', function () {
        it('asserts array .length', function () {
            expect([], 'to have length', 0);
            expect([1,2,3], 'to have length', 3);
            expect([1,2,3], 'to not have length', 4);
            expect({ length: 4 }, 'to have length', 4);
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect([1, 2], 'to have length', 3);
            }, 'to throw exception', "expected [ 1, 2 ] to have length 3");

            expect(function () {
                expect(null, 'to have length', 4);
            }, 'to throw exception', "Assertion 'to have length' only supports array like objects");

            expect(function () {
                expect({ length: 'foo' }, 'to have length', 4);
            }, 'to throw exception', "Assertion 'to have length' only supports array like objects");
        });
    });

    describe('property assertion', function () {
        it('asserts presence of an own property (and value optionally)', function () {
            expect([1, 2], 'to have property', 'length');
            expect([1, 2], 'to have property', 'length', 2);
            expect({a: 'b'}, 'to have property', 'a');
            expect({a: 'b'}, 'to have property', 'a', 'b');
            expect({a: 'b'}, 'to have property', 'toString');
            expect({a: 'b'}, 'to not have property', 'b');
            expect({a: 'b'}, 'to have own property', 'a');
            expect(create({a: 'b'}), 'to not have own property', 'a');
            expect(1, 'to not have property', 'a');
            expect(null, 'to not have property', 'a');
            expect(undefined, 'to not have property', 'a');
            expect(true, 'to not have property', 'a');
            expect(false, 'to not have property', 'a');
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect({a: 'b'}, 'to have property', 'b');
            }, 'to throw exception', "expected { a: 'b' } to have property 'b'");

            expect(function () {
                expect(null, 'to have property', 'b');
            }, 'to throw exception', "expected null to have property 'b'");

            expect(function () {
                expect({a: 'b'}, 'to have property', 'a', 'c');
            }, 'to throw exception', "expected { a: 'b' } to have property 'a', 'c'");

            expect(function () {
                // property expectations on value expects the property to be present
                expect(null, 'to not have property', 'a', 'b');
            }, 'to throw exception', "expected null to not have property 'a', 'b'");

            expect(function () {
                // property expectations on value expects the property to be present
                expect(null, 'to not have own property', 'a', 'b');
            }, 'to throw exception', "expected null to not have own property 'a', 'b'");
        });
    });

    describe('empty assertion', function () {
        it('asserts presence of an own property (and value optionally)', function () {
            expect([], 'to be empty');
            expect('', 'to be empty');
            expect({}, 'to be empty');
            expect({ length: 0, duck: 'typing' }, 'to be empty');
            expect({ my: 'object' }, 'to not be empty');
            expect([1,2,3], 'to not be empty');
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect([1,2,3], 'to be empty');
            }, 'to throw exception', "expected [ 1, 2, 3 ] to be empty");

            expect(function () {
                expect(null, 'to be empty');
            }, 'to throw exception', "Assertion 'to be empty' only supports strings, arrays and objects");
        });
    });

    describe('key assertion', function () {
        it('asserts the presence of a key', function () {
            expect({ a: 'b' }, 'to have key', 'a');
            expect({ a: 'b' }, 'to not have key', 'b');
            expect({ a: 'b', c: 'd' }, 'to not only have key', 'a');
            expect({ a: 'b', c: 'd' }, 'to only have keys', 'a', 'c');
            expect({ a: 'b', c: 'd' }, 'to only have keys', ['a', 'c']);
            expect({ a: 'b', c: 'd', e: 'f' }, 'to not only have keys', ['a', 'c']);
            expect(null, 'to not have key', 'a');
            expect(undefined, 'to not have key', 'a');
            expect(true, 'to not have key', 'a');
            expect(false, 'to not have key', 'a');
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect({ a: 'b', b: 'c' }, 'to have key', 'e');
            }, 'to throw exception', "expected { a: 'b', b: 'c' } to have key 'e'");

            expect(function () {
                expect({ a: 'b', b: 'c' }, 'to only have key', 'b');
            }, 'to throw exception', "expected { a: 'b', b: 'c' } to only have key 'b'");

            expect(function () {
                expect({ a: 'b', b: 'c' }, 'to not have key', 'b');
            }, 'to throw exception', "expected { a: 'b', b: 'c' } to not have key 'b'");

            expect(function () {
                expect({ a: 'b', c: 'd' }, 'to not only have keys', ['a', 'c']);
            }, 'to throw exception', "expected { a: 'b', c: 'd' } to not only have keys [ 'a', 'c' ]");

            expect(function () {
                expect({ a: 'b', c: 'd' }, 'to only have keys', 'a', 'd');
            }, 'to throw exception', "expected { a: 'b', c: 'd' } to only have keys 'a', 'd'");

            expect(function () {
                expect({ a: 'b', c: 'd' }, 'to not only have keys', 'a', 'c');
            }, 'to throw exception', "expected { a: 'b', c: 'd' } to not only have keys 'a', 'c'");
        });
    });

    describe('within assertion', function () {
        it('asserts a number within a range', function () {
            expect(0, 'to be within', 0, 4);
            expect(1, 'to be within', 0, 4);
            expect(4, 'to be within', 0, 4);
            expect(-1, 'to not be within', 0, 4);
            expect(5, 'to not be within', 0, 4);
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect(4, 'to not be within', 0, 4);
            }, 'to throw exception', "expected 4 to not be within '0..4'");
            expect(function () {
                expect(null, 'to not be within', 0, 4);
            }, 'to throw exception', "expected null to not be within '0..4'");
        });
    });

    describe('less than assertion', function () {
        it('asserts <', function () {
            expect(0, 'to be less than', 4);
            expect(0, 'to be below', 1);
            expect(3, 'to be <', 4);
            expect(3, '<', 4);
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect(0, 'to be less than', 0);
            }, 'to throw exception', "expected 0 to be less than 0");
        });
    });

    describe('less than or equals assertion', function () {
        it('asserts <=', function () {
            expect(0, 'to be less than or equals to', 4);
            expect(4, 'to be <=', 4);
            expect(3, '<=', 4);
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect(0, 'to be less than or equals to', -1);
            }, 'to throw exception', "expected 0 to be less than or equals to -1");
        });
    });

    describe('greater than assertion', function () {
        it('assert >', function () {
            expect(3, 'to be greater than', 2);
            expect(1, 'to be above', 0);
            expect(4, 'to be >', 3);
            expect(4, '>', 3);
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect(0, 'to be greater than', 0);
            }, 'to throw exception', "expected 0 to be greater than 0");
        });
    });

    describe('greater than or equals assertion', function () {
        it('assert >=', function () {
            expect(3, 'to be greater than or equals to', 2);
            expect(3, 'to be >=', 3);
            expect(3, '>=', 3);
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect(-1, 'to be greater than or equals to', 0);
            }, 'to throw exception', "expected -1 to be greater than or equals to 0");
        });
    });

    describe('positive assertion', function () {
        it('assert that a number is positive', function () {
            expect(3, 'to be positive');
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect(0, 'to be positive');
            }, 'to throw exception', "expected 0 to be positive");
        });
    });

    describe('negative assertion', function () {
        it('assert that a number is negative', function () {
            expect(-1, 'to be negative');
        });

        it('throws when the assertion fails', function () {
            expect(function () {
                expect(0, 'to be negative');
            }, 'to throw exception', "expected 0 to be negative");
        });
    });

    describe('fail assertion', function () {
        it('throws an error', function () {
            expect(function () {
                expect.fail();
            }, 'to throw exception', "explicit failure");
        });

        it('throws an error with a given message', function () {
            expect(function () {
                expect.fail('fail with error message');
            }, 'to throw exception', "fail with error message");
        });

        it('supports placeholders', function () {
            expect(function () {
                expect.fail('{0} was expected to be {1}', 0, 'zero');
            }, 'to throw exception', "0 was expected to be 'zero'");

            expect(function () {
                expect.fail('{0} was expected to be {1}', 0);
            }, 'to throw exception', "0 was expected to be {1}");
        });

        it('throws if the assertion does not exists', function () {
            expect(function () {
                expect(1, "foo bar", 2);
            }, 'to throw exception', 'Unknown assertion "foo bar", did you mean: "to be"');
        });
    });

    function sortBy(arr, property) {
        arr.sort(function (x, y) {
            var xp = x[property];
            var yp = y[property];
            if (xp > yp) { return 1; }
            if (xp < yp) { return -1; }
            return 0;
        });
    }

    describe('internal', function () {
        describe('expandPattern', function () {
            it('expands patterns containing multiple flags', function () {
                var expanded = expect.internal.expandPattern('foo [not] [only] bar');
                sortBy(expanded, 'text');

                expect(expanded, 'to equal', [
                    { text: 'foo bar', flags: []},
                    { text: 'foo not bar', flags: ['not']},
                    { text: 'foo not only bar', flags: ['not', 'only']},
                    { text: 'foo only bar', flags: ['only']}
                ]);
                expect(expanded.length, 'to be', 4);
            });
            it('expands patterns alternations', function () {
                var expanded = expect.internal.expandPattern('foo (bar|bar baz) (qux|quux)');
                sortBy(expanded, 'text');

                expect(expanded, 'to equal', [
                    { text: 'foo bar baz quux', flags: []},
                    { text: 'foo bar baz qux', flags: []},
                    { text: 'foo bar quux', flags: []},
                    { text: 'foo bar qux', flags: []}
                ]);
                expect(expanded.length, 'to be', 4);
            });
        });
    });
});
